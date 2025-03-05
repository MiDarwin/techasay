"use client";
import React, { useEffect, useState } from 'react';
import { getAllBranches } from '../utils/api';

interface Branch {
  company_id: number;
  branch_name: string;
  address: string;
  city: string;
  phone_number: string;
  _id: string;
  created_at: string;
  updated_at: string;
}

const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getAllBranches();
        setBranches(data); // API'den dönen verinin doğrudan dizi olduğunu varsayıyorum
      } catch (err) {
        setError('Şubeler yüklenirken bir hata oluştu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Şubeler</h1>
      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Şube Adı</th>
            <th>Adres</th>
            <th>Şehir</th>
            <th>Telefon Numarası</th>
            <th>Oluşturulma Tarihi</th>
            <th>Güncellenme Tarihi</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch._id}>
              <td>{branch._id}</td>
              <td>{branch.branch_name}</td>
              <td>{branch.address}</td>
              <td>{branch.city}</td>
              <td>{branch.phone_number}</td>
              <td>{new Date(branch.created_at).toLocaleString()}</td>
              <td>{new Date(branch.updated_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BranchesPage;