import React from 'react';

const RoleSelectionModal = ({ isOpen, onClose, onRoleSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Select Your Role</h2>
        
        <div className="space-y-4">
          <button
            onClick={() => onRoleSelect('patient')}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Continue as Patient
          </button>
          
          <button
            onClick={() => onRoleSelect('doctor')}
            className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Continue as Doctor
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RoleSelectionModal; 