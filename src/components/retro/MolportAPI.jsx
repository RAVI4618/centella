import React, { useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';
import SmileViewer from '../smileViewer';
import Modal from 'react-modal';
import { index } from 'd3';
import { IoMdClose, } from "react-icons/io";
import { LuExternalLink } from "react-icons/lu";
import { FaInfoCircle } from "react-icons/fa";
import { X, ShoppingBag } from 'lucide-react';


const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '90vh',
    overflowY: 'auto',
    width: '80%',
    zIndex: 9999,
  },
  overlay: {
    zIndex: 9998,  // Add this to ensure the overlay appears behind the modal but above other content
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Optional: Makes the background darker for better contrast
  },
};

const SupplierTabs = ({ selectedTab, onTabChange, supplierData }) => {
  const tabs = [
    { id: 'building', label: 'Building Block Suppliers' },
    { id: 'screening', label: 'Screening Block Suppliers' },

    { id: 'virtual', label: 'Virtual Suppliers' }
  ];

  return (
    <div className="mb-4">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            const hasData = supplierData[tab.label]?.length > 0;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`mr-2 py-2 px-4 text-sm font-medium rounded-t-lg ${isActive
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {tab.label}
                {hasData && (
                  <span className="ml-2 bg-white text-blue-500 px-2 py-0.5 rounded-full text-xs">
                    {supplierData[tab.label].length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

const SupplierInfo = ({ catalogue }) => (
  <div className="mb-4 p-4 border rounded shadow-sm">
    <p><strong>Supplier Name:</strong> {catalogue["Supplier Name"]}</p>
    <p><strong>Purity:</strong> {catalogue.Catalogues[0].Purity}</p>
    <p><strong>Available Packings:</strong></p>
    <ul className="list-disc pl-5 mt-2">
      {catalogue.Catalogues[0]["Available Packings"].map((packing, idx) => (
        <li key={idx} className="text-sm">
          {packing.Amount} {packing.Measure} - {packing.Price} {packing.Currency}
        </li>
      ))}
    </ul>
  </div>
);

const NoDataMessage = ({ category }) => (
  <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 rounded-lg">
    <div className="text-gray-400 mb-2">
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-1">No Data Available</h3>
    <p className="text-gray-500 text-center">
      There are currently no suppliers available in the {category} category.
    </p>
  </div>
);

const MoleculeDetailsModal = ({ isOpen, onClose, moleculeDetails }) => {
  const [selectedSupplierTab, setSelectedSupplierTab] = useState('building');

  if (!isOpen || !moleculeDetails) return null;

  const supplierCategories = {
    'Screening Block Suppliers': moleculeDetails.Data.Molecule.Catalogues["Screening Block Suppliers"] || [],
    'Building Block Suppliers': moleculeDetails.Data.Molecule.Catalogues["Building Block Suppliers"] || [],
    'Virtual Suppliers': moleculeDetails.Data.Molecule.Catalogues["Virtual Suppliers"] || []
  };

  const getActiveSuppliers = () => {
    const tabToCategory = {
      'screening': 'Screening Block Suppliers',
      'building': 'Building Block Suppliers',
      'virtual': 'Virtual Suppliers'
    };
    return supplierCategories[tabToCategory[selectedSupplierTab]] || [];
  };

  const getCurrentCategory = () => {
    const tabToCategory = {
      'screening': 'Screening Block Suppliers',
      'building': 'Building Block Suppliers',
      'virtual': 'Virtual Suppliers'
    };
    return tabToCategory[selectedSupplierTab];
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Molecule Details</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="mb-6 space-y-3">
        <h3 className="text-xl font-bold">{moleculeDetails.Data.Molecule.IUPAC}</h3>
        <p><strong>Formula:</strong> {moleculeDetails.Data.Molecule.Formula}</p>
        <p><strong>Molecular Weight:</strong> {moleculeDetails.Data.Molecule["Molecular Weight"]} g/mol</p>
        <p className="flex items-center space-x-2">
          <strong>Molport ID:</strong>
          <span>{moleculeDetails.Data.Molecule["Molport Id"]}</span>
          <a
            href={`https://www.molport.com/shop/compound/${moleculeDetails.Data.Molecule['Molport Id']}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            <LuExternalLink className="inline" />
          </a>
        </p>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-bold mb-4">Supplier Information</h4>
        <SupplierTabs
          selectedTab={selectedSupplierTab}
          onTabChange={setSelectedSupplierTab}
          supplierData={supplierCategories}
        />

        <div className="mt-4">
          {getActiveSuppliers().length > 0 ? (
            getActiveSuppliers().map((catalogue, index) => (
              <SupplierInfo key={index} catalogue={catalogue} />
            ))
          ) : (
            <NoDataMessage category={getCurrentCategory()} />
          )}
        </div>
      </div>
    </div>
  );
};



function MolportAPI({ inputValue, activeTab, selectedSupplier, setFilteredData }) {
  const [loading, setLoading] = useState(false);
  const [molecules, setMolecules] = useState([]);
  const [selectedMoleculeDetails, setSelectedMoleculeDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log('inputValue:', inputValue);
    console.log('selectedSupplier:', selectedSupplier);
    console.log('activeTab:', activeTab);

    if (inputValue && selectedSupplier === 'molport') {
      setLoading(true);

      const fetchMolportData = async () => {
        try {
          let endpoint = '';
          const normalizedTab = activeTab.toLowerCase().trim();
          let apiType;

          if (normalizedTab.includes('exact')) {
            apiType = 'exact-search';
          } else if (normalizedTab.includes('similarity')) {
            apiType = 'similarity-search';
          } else if (normalizedTab.includes('substructure')) {
            apiType = 'substructure-search';
          } else {
            throw new Error('Invalid tab selected');
          }

          endpoint = `https://caitapimus.azure-api.net/retro/vendor/molport/${apiType}?smile=${inputValue}`;

          endpoint = `https://caitapimus.azure-api.net/retro/vendor/molport/${apiType}?smile=CCC(CO)(N(C)C)C1=CC=CC=C1`;
          console.log('Calling Molport API endpoint:', endpoint);

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('API Response:', data);

          if (data.Data && Array.isArray(data.Data.Molecules)) {
            const extractedMolecules = data.Data.Molecules.map(item => ({
              id: item.Id,
              molPortId: item["MolPort Id"],
              smiles: item.SMILES,
              canonicalSmiles: item["Canonical SMILES"],
              verifiedAmount: item["Verified Amount"],
              unverifiedAmount: item["Unverified Amount"],
              similarityIndex: item["Similarity Index"],
            }));

            setMolecules(extractedMolecules);
            setFilteredData(extractedMolecules);
          } else {
            console.warn('No molecules found in response:', data);
            setMolecules([]);
          }
        } catch (error) {
          console.error('Error fetching Molport data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchMolportData();
    } else {
      setMolecules([]);
    }
  }, [inputValue, activeTab, selectedSupplier, setFilteredData]);

  const handleCardClick = async (moleculeId) => {
    const endpoint = `https://caitapimus.azure-api.net/retro/vendor/molport/load-molecule?moleculeId=${moleculeId}`;
    console.log('Loading molecule details from:', endpoint);

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const moleculeDetails = await response.json();
      console.log('Molecule Details:', moleculeDetails);

      setSelectedMoleculeDetails(moleculeDetails);
      setIsModalOpen(true);  // Open the modal with molecule details
    } catch (error) {
      console.error('Error fetching molecule details:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <div className="ml-12 max-h-auto rounded-lg w-[95%]">
      {molecules.length > 0 ? (
        <div className='relative'>
          <div className="overflow-x-auto overflow-y-auto max-w-full">
            <div className='inline-block min-w-full'>
              <table className="w-full border-2 border-[#CBD5E0] bg-white rounded-lg shadow-lg table-fixed">
                <thead className='bg-[#4A5568]'>
                  <tr>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white border-l border-r border-gray-300 uppercase w-1/6">Input Structure</th>
                    {/* <th className="px-6 py-3 text-center text-sm font-semibold text-white border-l border-r border-gray-300 uppercase w-1/6">SMILES</th> */}
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white border-l border-r border-gray-300 uppercase w-1/6">Structure</th>
                    {/* <th className="px-6 py-3 text-center text-sm font-semibold text-white border-l border-r border-gray-300 uppercase w-1/6">Verified Amount</th> */}
                    {/* <th className="px-6 py-3 text-center text-sm font-semibold text-white border-l border-r border-gray-300 uppercase w-1/6">Unverified Amount</th> */}
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white border-l border-r border-gray-300 uppercase w-1/6">Similarity Index</th>
                  </tr>
                </thead>
                <tbody>
                  {molecules.map((molecule) => (
                    <tr key={molecule.id} className="over:bg-[#F4F4F4] border-b border-l border-2 border-r border-gray-300">
                      <td className="px-6 py-4 border-l border-2 border-r border-gray-300">
                        <SmileViewer smileString={inputValue} />
                      </td>

                      {/* <td className="px-2 py-4 w-1/6 relative overflow-hidden">
                                                <div className='flex w-full'>
                                                    <p
                                                        className="break-words break-all whitespace-normal pr-2 flex-1"
                                                        title={molecule.canonicalSmiles}
                                                    >
                                                        {molecule.canonicalSmiles}
                                                    </p>
                                                    <FaInfoCircle
                                                        onClick={() => handleCardClick(molecule.id)}
                                                        className="hover:text-blue-500 cursor-pointer"
                                                        size={18}
                                                    />
                                                </div>
 
                                            </td> */}


                      <td className="px-6 py-4  border-l  border-r border-gray-300">
                        <div className="flex items-center space-x-2">
                          <SmileViewer smileString={molecule.canonicalSmiles} />
                          <FaInfoCircle
                            onClick={() => handleCardClick(molecule.id)}
                            className="hover:text-blue-500 cursor-pointer"
                            size={18}
                          />
                        </div>
                      </td>
                      {/* <td className="px-6 py-4  border-l border-2 border-r border-gray-300">
                                                {molecule.verifiedAmount || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4  border-l border-2 border-r border-gray-300">
                                                {molecule.unverifiedAmount || 'N/A'}
                                            </td> */}
                      <td className="px-6 py-4  text-center border-l border-2 border-r border-gray-300">
                        <span className={`px-3 py-1   text-dark ${molecule.similarityIndex === 1 ? 'text-green-600' : 'text-dark'}`}>
                          {molecule.similarityIndex || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-600">No molecules found.</p>
      )}

      {/* Modal for molecule details */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Molecule Details"
      >
        <MoleculeDetailsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          moleculeDetails={selectedMoleculeDetails}
        />
      </Modal>
    </div>

  );
}

export default MolportAPI;

