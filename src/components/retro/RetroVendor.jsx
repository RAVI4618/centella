import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaInfoCircle, FaTimes, FaChevronDown, FaFilter, FaChevronUp, FaExternalLinkAlt, FaSmile, FaFlask, FaPuzzlePiece, FaCog, FaCogs } from 'react-icons/fa';
import Loader from '../Loader';
import MolportAPI from './MolportAPI';
import jsPDF from 'jspdf';
import SmileViewer from '../smileViewer';
import { FiCopy, FiDownload } from 'react-icons/fi';
import { IoSearchOutline } from 'react-icons/io5';
import axios from 'axios';
import { ArrowLeft, Info, X } from 'lucide-react';
import '../../styles/editor.css'
import { Cylinder } from 'lucide-react';

//  import { Tooltip } from "@/components/ui/tooltip";

function RetroVendorScreen({ showBackButton = true }) {

  const smilesRef = useRef(null)
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSupplier, setSelectedSupplier] = useState('chemspace');
  const [isSupplierChanging, setIsSupplierChanging] = useState(false)
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('Exact Search');
  const [showProperties, setShowProperties] = useState(null);
  const [expandedVendor, setExpandedVendor] = useState(null);
  const [showPropertiesDialog, setShowPropertiesDialog] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState(null);
  const [selectedSmiles, setSelectedSmiles] = useState(null)
  const [selectedFilters, setSelectedFilters] = useState({
    vendors: [],
    leadTimes: [],
    prices: [],
    routeTypes: [],
  });
  const [temporaryFilters, setTemporaryFilters] = useState({
    vendors: [],
    leadTimes: [],
    prices: [],
    routeTypes: [],
  });
  const [loading, setLoading] = useState(false);

  const [smilesData, setSmilesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);


  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const handlePropertiesClick = (properties, smiles) => {
    setSelectedProperties(properties);
    setShowPropertiesDialog(true);
    setSelectedSmiles(smiles)
  };

  const handleCopySmiles = (smiles) => {
    navigator.clipboard.writeText(smiles);
    alert('SMILES copied to clipboard!');
  };


  useEffect(() => {
    if (location.state?.reactantString) {
      setInputValue(location.state.reactantString);
    }
  }, [location.state]);
  useEffect(() => {
    if (location.state?.smile) {
      setInputValue(location.state.smile);
    }
  }, [location.state]);


  // Add this state
  const [activeCategory, setActiveCategory] = useState('Screening Compounds');

  // Modify the useEffect for API calls
  useEffect(() => {
    if (inputValue) {
      setLoading(true);
      const fetchVendorData = async () => {
        try {
          const baseUrl = 'https://caitapimus.azure-api.net/retro-uat/vendor/chemspace';
          const headers = {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82',
          };

          // Map the search type to correct API endpoint
          let searchType = '';
          switch (activeTab) {
            case 'Substructure Search':
              searchType = 'sub-search';
              break;
            case 'Similarity Search':
              searchType = 'similarity-search';
              break;
            case 'Exact Search':
              searchType = 'exact-search';
              break;
            default:
              searchType = 'exact-search';
          }

          // Map the category to correct API endpoint
          let category = '';
          switch (activeCategory) {
            case 'Screening Compounds':
              category = 'screening-compounds';
              break;
            case 'Building Blocks':
              category = 'building-blocks';
              break;
            case 'Custom Synthesis':
              category = 'custom-synthesis';
              break;
            default:
              category = 'screening-compounds';
          }

          const url = `${baseUrl}/${searchType}/${category}`;
          console.log('Requesting URL:', url); // For debugging

          const requestBody = {
            shipToCountry: 'US',
            smile: inputValue
          };

          const response = await axios.post(url, requestBody, { headers });

          const formattedData = (response.data.items || []).map(item => ({
            smiles: item.smiles || '',
            csId: item.csId || '',
            link: item.link || '',
            properties: item.properties || {},
            vendors: Array.isArray(item.offers) ? item.offers.map((offer) => ({
              vendorName: offer.vendorName || 'Unknown',
              leadTime: offer.leadTimeDays || 'N/A',
              prices: Array.isArray(offer.prices) ? offer.prices : [],
            })) : [],
            type: category
          }));

          setSmilesData(formattedData);
          setFilteredData(formattedData);
        } catch (error) {
          console.error('Error fetching data:', error);
          setSmilesData([]);
          setFilteredData([]);
        } finally {
          setLoading(false);
        }
      };

      fetchVendorData();
    }
  }, [inputValue, activeTab, activeCategory, selectedSupplier]);



  useEffect(() => {
  }, [selectedFilters, smilesData]);



  const handleSupplierChange = (e) => {
    setIsSupplierChanging(true);
    setSelectedSupplier(e.target.value);
    // Clear data when switching suppliers
    setSmilesData([]);
    setFilteredData([]);
    setIsSupplierChanging(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const buttonNames = ['Exact Search', 'Similarity Search', 'Substructure Search'];

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const toggleVendorDropdown = (index) => {
    setExpandedVendor(expandedVendor === index ? null : index);
  };

  const toggleProperties = (index) => {
    setShowProperties(showProperties === index ? null : index);
  };

  const handleCheckboxChange = (category, option) => {
    setTemporaryFilters(prevState => {
      const updatedCategory = prevState[category].includes(option)
        ? prevState[category].filter(item => item !== option)
        : [...prevState[category], option];

      return {
        ...prevState,
        [category]: updatedCategory,
      };
    });
  };



  useEffect(() => {

    if (isAnyFilterSelected()) {
      applyFilters();
    } else {
      setFilteredData(smilesData);
    }
  }, [temporaryFilters, smilesData]);

  const isAnyFilterSelected = () => {
    return Object.values(temporaryFilters).some(filterArray => filterArray.length > 0);
  };


  const applyFilters = () => {
    let filtered = smilesData;

    if (temporaryFilters.vendors.length > 0) {
      filtered = filtered.filter(item =>
        item.vendors.some(vendor => temporaryFilters.vendors.includes(vendor.vendorName))
      );
    }

    if (temporaryFilters.prices.length > 0) {
      filtered = filtered.filter(item =>
        item.vendors.some(vendor =>
          vendor.prices.some(price =>
            temporaryFilters.prices.includes(`${price.priceUsd || 'N/A'} USD / ${price.priceEur || 'N/A'} EUR`)
          )
        )
      );
    }

    if (temporaryFilters.leadTimes.length > 0) {
      filtered = filtered.filter(item =>
        item.vendors.some(vendor =>
          temporaryFilters.leadTimes.includes(`${vendor.leadTime} days`)
        )
      );
    }

    setFilteredData(filtered);
  };

  const handleBackClick = () => {
    navigate(-1); // This will go back to the previous page
  };
  return (
    <div >

      {loading && (
        <div className="fixed inset-0  backdrop-blur-sm  bg-opacity-50 z-50 flex items-center justify-center">
          <Loader />
        </div>
      )}

      <div>
        {showBackButton && activeTab !== 'vendor' && (
          <button onClick={handleBackClick} className="back-button mt-6 ml-8 flex items-center text-dark">
            <ArrowLeft height={20} width={20} style={{ marginRight: '5px' }} />
            Back
          </button>
        )}
      </div>
      <div className="p-6 font-segoe relative right-6">
        {/* Input and Search Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full mb-6">
          <input
            type="text"
            placeholder="Enter SMILES to check Vendor availability"
            value={inputValue}
            onChange={handleInputChange}
            className="flex-1 h-[32px] w-full bg-white shadow-sm border border-gray-300 rounded-[5px] px-4 focus:outline-none focus:ring-2 focus:ring-[#735AA7]"
          />
          <button className="w-[120px]  tracking-[1px] font-segoe h-[32px] bg-[#735AA7] hover:bg-[#863FC4] shadow-md text-white rounded-lg flex items-center justify-center gap-2">
            <span>Search</span>
            {/* <IoSearchOutline size={22} /> */}
          </button>
        </div>



        {/* Search Categories and Supplier Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Search Categories Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Search Categories</h2>
            <div className="grid grid-cols-1 gap-3">
              {buttonNames.map((name, index) => (
                <button
                  key={index}
                  onClick={() => handleTabClick(name)}
                  className={`h-[40px] rounded-md text-sm sm:text-base font-semibold shadow-md transition-all duration-300 
        ${activeTab === name
                      ? 'border-[#2193D7] border-2 text-white '
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }
        bg-[#2193D7]  focus:outline-none focus:ring-2 focus:ring-[#2193D7] focus:ring-offset-2`}
                >
                  {name}
                </button>
              ))}
            </div>


          </div>

          {/* Suppliers Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Suppliers</h2>
            <div className="flex flex-col">
            <div className="flex items-center space-x-2">
  <label className="text-md text-gray-600">Select Supplier Database</label>
  <Cylinder className='h-4 w-4' />
</div>

              <select
                value={selectedSupplier}
                onChange={handleSupplierChange}
                className="w-full bg-white text-gray-700 font-semibold shadow-sm border border-gray-300 rounded-lg 
          px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#735AA7] transition-all duration-300
          hover:border-[#735AA7]"
              >
                <option value="chemspace">Chemspace</option>
                <option value="molport">Molport</option>
              </select>
            </div>
          </div>
        </div>


      </div>



      {selectedSupplier === 'chemspace' && (
        <div className=" font-segoe">
          <div className="grid grid-cols-1 gap-4">
            {/* Categories Card */} 
            <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">
                Product Categories
              </h2>
              <div className="flex flex-row justify-between gap-3">
                {[
                  { name: 'Screening Compounds', icon: <FaFlask size={18} /> },
                  { name: 'Building Blocks', icon: <FaPuzzlePiece size={18} /> },
                  { name: 'Custom Synthesis', icon: <FaCogs size={18} /> }
                ].map((category) => (
                  <div
                    key={category.name}
                    onClick={() => setActiveCategory(category.name)}
                    className={`
          cursor-pointer rounded-lg transition-all duration-300
          ${activeCategory === category.name
                        ? 'bg-gradient-to-r from-[#735DA8] to-[#8A7DB8] text-white shadow-md transform scale-105'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-[#735DA8] hover:shadow-sm'
                      }
        `}
                  >
                    <div className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className={`
              p-1.5 rounded-full 
              ${activeCategory === category.name
                            ? 'bg-white/20'
                            : 'bg-gray-100'
                          }
            `}>
                          {category.icon}
                        </div>
                        <span className="font-medium text-sm">
                          {category.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Results Table */}
            <div className="col-span-4 ml-2 overflow-hidden">
              <div className="flex">
                {/* Conditionally render the Fixed Input Structure Column if data is available */}
                {filteredData.length > 0 && (
                  <div className="sticky left-0 top-0 bg-white z-10">
                    <table className="min-w-full bg-white rounded-lg ">
                      <thead>
                        <tr>
                          <th className="px-36 py-3 text-center text-sm font-semibold text-white bg-[#4A5568]">
                            Input Structure
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-6 sticky left-0 z-10 h-auto">
                            <div className="flex justify-center">
                              <div className="transition-transform mt-[10%] duration-300 hover:scale-150">
                                <SmileViewer smileString={inputValue} imgwidth={200} imgheight={200} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Scrollable Result Structure and Details Columns */}
                <div className="overflow-x-auto overflow-y-auto max-h-[30rem] flex-1 scrollbar-default">
                  {/* Show the table only if there is data */}
                  {filteredData.length > 0 ? (
                    <table className="min-w-full border-2 border-[#CBD5E0] bg-white rounded-lg shadow-lg">
                      <thead className="bg-[#4A5568] sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3 text-center text-sm font-semibold text-white border-r">
                            Result Structure
                          </th>
                          <th className="px-6 py-3 text-center text-sm font-semibold text-white">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={index} className="hover:bg-white border-b">
                            {/* Scrollable Result Structure Column */}
                            <td className="px-6 py-4 border-r h-48">
                              <div className="flex flex-col justify-center items-center space-x-4">
                                <div className="transition-transform duration-300 hover:scale-150">
                                  <SmileViewer smileString={item.smiles} imgwidth={150} imgheight={150} />
                                </div>
                                <button
                                  onClick={() => handlePropertiesClick(item.properties, item.smiles)}
                                  className="p-2 mt-2"
                                >
                                  <Info className="ml-4" size={20} />
                                </button>
                              </div>
                            </td>

                            {/* Scrollable Details Column */}
                            <td className="px-6 py-4 h-48">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold">Vendor:</span>
                                  <span className="font-bold text-[#735AA7]">
                                    {item.vendors[0]?.vendorName || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold">Price:</span>
                                  <span>
                                    {item.vendors[0]?.prices[0]?.priceUsd
                                      ? `$${item.vendors[0].prices[0].priceUsd}`
                                      : 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold">Lead Time:</span>
                                  <span>{item.vendors[0]?.leadTime || 'N/A'} days</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold">Purchase:</span>
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                  >
                                    <FaExternalLinkAlt className="text-gray-600 hover:text-[#735AA7]" size={18} />
                                  </a>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex justify-center items-center py-8 text-gray-500 text-lg font-medium">
                      Data is not available for this compound.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Properties Modal */}

      {showPropertiesDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-gray-800 opacity-75"
            aria-hidden="true"
            onClick={() => setShowPropertiesDialog(false)}
          />

          {/* Modal panel */}
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-lg shadow-xl transform transition-all w-3/5 max-h-[80vh] overflow-auto relative">
              {/* Header */}
              <div className="relative p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Molecular Descriptors</h2>
                  <button
                    onClick={() => setShowPropertiesDialog(false)}
                    className="absolute top-5 right-5 bg-red-400 text-white hover:text-gray-600  flex items-center justify-center px-2 py-1 rounded-md"
                  >
                    <X className='h-6 w-6' />
                  </button>
                </div>

                <div className="flex justify-center items-center mb-4">
                  {selectedSmiles ? (
                    <>
                      <SmileViewer smileString={selectedSmiles} className="w-auto h-48" />
                    </>
                  ) : (
                    <p>No SMILES structure available.</p>
                  )}
                </div>

                <hr />

                {/* Properties Table */}
                <div className="border-2 border-gray-300 rounded-lg mt-4">
                  <table className="w-full border-collapse uppercase">
                    <tbody>
                      {selectedProperties ? (
                        (() => {
                          const entries = Object.entries(selectedProperties).filter(
                            ([key]) => key !== 'img'
                          );
                          const half = Math.ceil(entries.length / 2);
                          const leftColumn = entries.slice(0, half);
                          const rightColumn = entries.slice(half);

                          return leftColumn.map(([keyLeft, valueLeft], index) => {
                            const [keyRight, valueRight] = rightColumn[index] || [];
                            return (
                              <tr key={index} className="border-b text-sm border-gray-200">
                                {/* Left Column Property */}
                                <td className="py-3 px-4 font-semibold text-gray-700 border-r border-gray-200">
                                  {keyLeft}
                                </td>
                                <td className="py-3 px-4 text-right text-gray-900 border-r border-gray-200">
                                  {typeof valueLeft === 'number'
                                    ? valueLeft.toFixed(3)
                                    : valueLeft}
                                </td>

                                {/* Right Column Property */}
                                {keyRight ? (
                                  <>
                                    <td className="py-3 px-4 font-semibold text-gray-700 border-l border-gray-200">
                                      {keyRight}
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-900">
                                      {typeof valueRight === 'number'
                                        ? valueRight.toFixed(3)
                                        : valueRight}
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="py-3 px-4 border-l border-gray-200"></td>
                                    <td className="py-3 px-4"></td>
                                  </>
                                )}
                              </tr>
                            );
                          });
                        })()
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-4 text-center text-gray-500">
                            No properties available for this molecule.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      <div className='mt-10'>
        {selectedSupplier === 'molport' && (
          <MolportAPI
            inputValue={inputValue}
            activeTab={activeTab}
            setFilteredData={setFilteredData}
            selectedSupplier={selectedSupplier}
          />
        )}

      </div>

    </div>
  );
}

export default RetroVendorScreen;


