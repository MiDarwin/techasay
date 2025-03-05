// src/components/BranchTable.jsx

import React from 'react';
import PropTypes from 'prop-types';

const BranchTable = ({ branches, companies, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr>
          <th className="py-2 px-4 border-b">Şube ID</th>
            <th className="py-2 px-4 border-b">Şube Adı</th>
            <th className="py-2 px-4 border-b">Şirket Adı</th>
            <th className="py-2 px-4 border-b">Adres</th>
            <th className="py-2 px-4 border-b">Şehir</th>
            <th className="py-2 px-4 border-b">Telefon Numarası</th>
            <th className="py-2 px-4 border-b">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch._id}>
              <td className='py-2 px-4 border-b'>{branch._id}</td>
              <td className="py-2 px-4 border-b">{branch.branch_name}</td>
              <td className="py-2 px-4 border-b">{companies[branch.company_id]}</td>
              <td className="py-2 px-4 border-b">{branch.address}</td>
              <td className="py-2 px-4 border-b">{branch.city}</td>
              <td className="py-2 px-4 border-b">{branch.phone_number}</td>
              <td className="py-2 px-4 border-b flex space-x-2">
                <button
                  onClick={() => onEdit(branch)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-md"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => onDelete(branch._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md"
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

BranchTable.propTypes = {
  branches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired, // Şube id'si
      company_id: PropTypes.number.isRequired, // Şirket id'si
      branch_name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
      phone_number: PropTypes.string.isRequired,
    })
  ).isRequired,
  companies: PropTypes.object.isRequired, // { company_id: name }
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default BranchTable;