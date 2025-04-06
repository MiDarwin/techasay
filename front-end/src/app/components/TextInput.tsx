import React from "react";

type TextInputProps = {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export default function TextInput({
  id,
  type,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
}: TextInputProps) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      className="w-full text-black p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:indigo-600"
    />
  );
}
