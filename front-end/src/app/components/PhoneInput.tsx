import React from "react";

type PhoneInputProps = {
  id: string;
  value: string;
  type: string;
  placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: () => void; // onFocus özelliği opsiyonel hale getirildi
};

export default function PhoneInput({
    id,
    type,
    placeholder,
    value,
    onChange,
    onFocus,
  }: PhoneInputProps) {
    return (
        <div className="relative w-full">
        <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 pointer-events-none select-none">
        0
      </span>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value.slice(1)} // Kullanıcıdan baştaki "0" gizlenir
        onChange={onChange}
        className="pl-8 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      </div>
    );
}