
import pandas as pd
import requests
from typing import List, Tuple, Dict, Any


class RouteOptimizer:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.default_start = (40.93878625317155, 29.134145602489685)
        self.default_end = (40.93878625317155, 29.134145602489685)
        self.session = requests.Session()

    def read_farms_from_excel(self, file_path: str) -> List[Dict[str, Any]]:
        """Excel'den çiftlik verilerini okur (ondalık ayracı düzeltir)"""
        try:
            df = pd.read_excel(file_path)
            df.columns = [col.strip().lower() for col in df.columns]
            for col in ['enlem', 'boylam']:
                if col in df.columns and df[col].dtype == 'object':
                    df[col] = (
                        df[col]
                        .astype(str)
                        .str.replace(',', '.', regex=False)
                        .astype(float)
                    )
            return df.to_dict('records')
        except Exception as e:
            raise ValueError(f"Excel okuma hatası: {e}")

    def optimize_route(
        self,
        start: Tuple[float, float],
        end: Tuple[float, float],
        waypoints: List[Tuple[float, float]]
    ) -> Dict[str, Any]:
        """Google Directions API ile optimize rota oluşturur"""
        if not waypoints:
            raise ValueError("En az bir ara nokta (waypoint) vermelisin.")

        endpoint = "https://maps.googleapis.com/maps/api/directions/json"
        params: Dict[str, Any] = {
            "origin": f"{start[0]:.6f},{start[1]:.6f}",
            "destination": f"{end[0]:.6f},{end[1]:.6f}",
            "key": self.api_key
        }
        wp = "|".join(f"{lat:.6f},{lng:.6f}" for lat, lng in waypoints)
        params["waypoints"] = f"optimize:true|{wp}"

        response = self.session.get(endpoint, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        if data.get("status") != "OK":
            raise RuntimeError(f"Google API hatası: {data.get('status')}")
        return data

    def generate_google_maps_url(
        self,
        start: Tuple[float, float],
        end: Tuple[float, float],
        waypoints: List[Tuple[float, float]],
        optimized_order: List[int]
    ) -> str:
        """Google Haritalar URL'si oluşturur"""
        base_url = "https://www.google.com/maps/dir/"
        start_str = f"{start[0]:.6f},{start[1]:.6f}"
        end_str = f"{end[0]:.6f},{end[1]:.6f}"

        if waypoints and optimized_order:
            ordered = [waypoints[i] for i in optimized_order]
            wp_str = "/".join(f"{lat:.6f},{lng:.6f}" for lat, lng in ordered)
            return f"{base_url}{start_str}/{wp_str}/{end_str}"
        else:
            return f"{base_url}{start_str}/{end_str}"
