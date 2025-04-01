
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SmilesDrawer from 'smiles-drawer';
import { IoCopyOutline, IoInformationCircle } from 'react-icons/io5';
import { CiWarning } from 'react-icons/ci';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import '../../styles/components.css'
import { useMsal } from "@azure/msal-react";
import * as echarts from 'echarts';
import Tooltip from '../../pages/bkp/Tooltip';
import Modal from '../../pages/bkp/FullScreenPopup';
import PropertiesTable from './AdmetFullscreen';
import { toast } from "sonner"



const AdmetResultPage = ({ onClose, smileString, projectName, predictionResult }) => {


  const validSmileString = smileString || '';
  const smilesRef = useRef(null);
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Physicochemical Properties');
  const [selectAll, setSelectAll] = useState(false);
  const [checkedCategories, setCheckedCategories] = useState({
    'Physicochemical Properties': true,
    'Absorption': false,
    'Distribution': false,
    'Metabolism': false,
    'Excretion': false,
    'Toxicity': false,
  });
  const { instance, inProgress } = useMsal();
  const activeAccount = instance.getActiveAccount();
  const userId = ` ${activeAccount?.name}`

  const [isModalOpen, setModalOpen] = useState(false);
  // const [predictionResult, setPredictionResult] = useState(null);

  const handleViewAll = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Function to split the SMILES string into two parts
  const splitSmilesString = (smileString) => {
    if (!smileString) {
      console.warn('Invalid SMILES string provided');
      return ['', '']; // Return empty strings if smileString is invalid
    }
    const midIndex = Math.ceil(smileString.length / 2);
    const firstHalf = smileString.slice(0, midIndex);
    const secondHalf = smileString.slice(midIndex);
    return [firstHalf, secondHalf];
  };
  const [firstHalf, secondHalf] = splitSmilesString(validSmileString);

  useEffect(() => {
    if (validSmileString) {
      if (smilesRef.current) {
        smilesRef.current.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.width = 310;
        canvas.height = 310;
        smilesRef.current.appendChild(canvas);

        const options = { width: 310, height: 310,bondThickness:1 };
        const smilesDrawer = new SmilesDrawer.Drawer(options);

        SmilesDrawer.parse(validSmileString, (tree) => {
          smilesDrawer.draw(tree, canvas, 'light', false);
        }, (err) => {
          console.error('Error parsing SMILES string:', err);
        });
      }
    }
  }, [validSmileString]);


  //download pdf format
  const downloadPDF = async () => {
    const pdf = new jsPDF();
    let y = 20;

    // Load logo image and place it in the right corner
    const loadLogoImage = () => {
      return new Promise((resolve, reject) => {
        const logoImage = new Image();
        logoImage.src = 'https://centellaai-win.azurewebsites.net/static/media/logo.da64b828b56147fd70da.png';
        logoImage.onload = () => resolve(logoImage);
        logoImage.onerror = reject;
      });
    };

    try {
      const logoImage = await loadLogoImage();
      const logoWidth = 12;
      const logoHeight = 14;
      // Place the logo at the top-right corner
      // Place the logo at the top-right corner
      pdf.addImage(logoImage, 'PNG', pdf.internal.pageSize.width - logoWidth - 10, 10, logoWidth, logoHeight);
      y += logoHeight + 10;
    } catch (error) {
      console.error('Error loading logo image:', error);
    }

    // Add a title section without shadow
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 102, 204); // Blue color
    pdf.text('ADMET Report', pdf.internal.pageSize.width / 2, y, { align: 'center' });
    y += 15;

    // Add project name in a styled box
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0); // Black color
    pdf.text(`Project Name:ADMET`, 10, y);
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(0, 51, 102);
    pdf.line(10, y + 2, pdf.internal.pageSize.width - 10, y + 2); // Horizontal line for emphasis
    y += 12;

    // Add structure image from canvas without a border
    const canvas = smilesRef.current.querySelector('canvas');
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', (pdf.internal.pageSize.width - 60) / 2, y, 60, 60); // Centered image without border
    y += 70;

    // Add SMILES string with a highlighted background
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'italic', 'bold');
    pdf.setTextColor(0, 51, 102); // Dark blue
    pdf.setFillColor(220, 230, 241); // Light blue background for SMILES string
    pdf.rect(10, y - 8, pdf.internal.pageSize.width - 20, 12, 'F');
    pdf.text(`SMILES: ${firstHalf}${secondHalf}`, 12, y);

    y += 15;

    // Add a decorative underline
    pdf.setDrawColor(0, 51, 102); // Blue color
    pdf.setLineWidth(0.75);
    pdf.line(10, y + 5, pdf.internal.pageSize.width - 10, y + 5);
    y += 20;

    // Loop through categories
    Object.keys(checkedCategories).forEach(categoryName => {
      // Add category name with black color and bold style
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0); // Black color for properties heading
      pdf.text(categoryName, 10, y);
      y += 10;

      // Prepare table rows for the category
      const categoryData = getCategoryData(categoryName);
      const tableRows = categoryData.map(({ property, value, idealRange }) => [
        property,
        value != null ? value.toFixed(3) : 'N/A',
        idealRange ? `${idealRange[0]} - ${idealRange[1]}` : 'N/A'
      ]);

      // Add table to PDF for the category without repeating the header
      pdf.autoTable({
        startY: y,
        head: [['Property', 'Value', 'Ideal Range']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: '#735AA7', textColor: [255, 255, 255], fontSize: 12 }, // Updated table heading color
        bodyStyles: { textColor: [0, 0, 0], fontSize: 10 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40 },
          2: { cellWidth: 60 },
        },
        showHead: 'firstPage', // Only show table header on the first page
      });

      y = pdf.autoTable.previous.finalY + 10;
    });

    // Add footer with page number and date
    const currentPage = pdf.internal.getNumberOfPages();
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150); // Grey color for footer
    pdf.text(`Page ${currentPage} of ${currentPage}`, 10, pdf.internal.pageSize.height - 10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pdf.internal.pageSize.width - 60, pdf.internal.pageSize.height - 10);


    // Finalize and save the PDF
    pdf.save('admet_results.pdf');
  };


  // Function to download CSV format
  const downloadExcel = () => {
    const csvData = [];
    Object.keys(checkedCategories).forEach(categoryName => {
      const categoryData = getCategoryData(categoryName);
      categoryData.forEach(({ property, value, idealRange }) => {
        csvData.push([
          categoryName,
          property,
          value?.toFixed(3) || 'N/A',
          idealRange ? `${idealRange[0]} - ${idealRange[1]}` : 'N/A'
        ]);
      });
    });

    // Create CSV string
    const csvContent = [
      ['Category', 'Property', 'Value', 'Ideal Range'], // Header row
      ...csvData
    ].map(e => e.join(',')).join('\n');

    // Create a blob and download it
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'admet_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };




  //properties for selected category
  const handleCategorySelection = (selectedCategory) => {
    const newCheckedCategories = {};
    Object.keys(checkedCategories).forEach(category => {
      newCheckedCategories[category] = category === selectedCategory;
    });
    setCheckedCategories(newCheckedCategories);
    setActiveCategory(selectedCategory);
  };


  const isValueOutOfRange = (value, idealRange) => {
    if (!idealRange || idealRange.length < 2) return false;
    const [min, max] = idealRange;
    return value < min || value > max;
  };

  const getCategoryData = (category) => {
    const dataMapping = {
      'Physicochemical Properties': [
        { property: 'logP', idealRange: [0, 5], value: predictionResult?.logP },
        { property: 'Mol wt', idealRange: [200, 500], value: predictionResult?.molecular_weight },
        { property: 'nHA', idealRange: [0, 10], value: predictionResult?.hydrogen_bond_acceptors },
        { property: 'nHD', idealRange: [0, 5], value: predictionResult?.hydrogen_bond_donors },
        { property: 'Lipinski', idealRange: [0, 5], value: predictionResult?.Lipinski },
        { property: 'QED', idealRange: [0.3, 1], value: predictionResult?.QED },
        // { property: 'StereoCenters', idealRange: [0, 5], value: predictionResult?.stereo_centers_drugbank_approved_percentile },
        // { property: 'HFE', idealRange: [-5, 0 ], value: predictionResult?.HydrationFreeEnergy_FreeSolv },
      ],
      'Absorption': [
        { property: 'Caco-2 Permeability', idealRange: [5, 13], value: predictionResult?.Caco2_Wang_drugbank_approved_percentile },
        { property: 'HIA', idealRange: [70, 100], value: predictionResult?.HIA_Hou_drugbank_approved_percentile },
        { property: 'Oral Bio av', idealRange: [0, 100], value: predictionResult?.Bioavailability_Ma },
        { property: 'Lipophilicity', idealRange: [-3, 3], value: predictionResult?.Lipophilicity_AstraZeneca_drugbank_approved_percentile },
        { property: 'Aqua Solubility', idealRange: [-5, -1], value: predictionResult?.Solubility_AqSolDB_drugbank_approved_percentile },
        { property: 'Pgp Inhibitor', idealRange: [0, 100], value: predictionResult?.Pgp_Broccatelli_drugbank_approved_percentile },
      ],
      'Distribution': [
        { property: 'PPB', idealRange: [0, 100], value: predictionResult?.PPBR_AZ },
        { property: 'Vol Dist', idealRange: [1, 5], value: predictionResult?.VDss_Lombardo },
        { property: 'PAMPA NCATS', idealRange: [0, 100], value: predictionResult?.PAMPA_NCATS_drugbank_approved_percentile },
        { property: 'BBB', idealRange: [0, 100], value: predictionResult?.BBB_Martins },
      ],
      'Metabolism': [
        { property: 'CYP2D6 Inhibtor', idealRange: [0, 100], value: predictionResult?.CYP2D6_Substrate_CarbonMangels },
        { property: 'CYP3A4 Inhibtor', idealRange: [0, 100], value: predictionResult?.CYP3A4_Substrate_CarbonMangels },
        { property: 'CYP2C9 Inhibtor', idealRange: [0, 100], value: predictionResult?.CYP2C9_Veith },
        { property: 'CYP2D6 Sub', idealRange: [0, 100], value: predictionResult?.CYP2D6_Substrate_CarbonMangels },
        { property: 'CYP3A4 Sub', idealRange: [0, 100], value: predictionResult?.CYP3A4_Substrate_CarbonMangels },
        { property: 'CYP2C9 Sub', idealRange: [0, 100], value: predictionResult?.CYP2C9_Substrate_CarbonMangels },
        { property: 'CYP3A4 ', idealRange: [0, 100], value: predictionResult?.CYP3A4_Veith },
      ],
      'Excretion': [
        { property: 'Half-Life ', idealRange: [0, 100], value: predictionResult?.Half_Life_Obach_drugbank_approved_percentile },
        { property: 'Clr Hepatocyte', idealRange: [0, 100], value: predictionResult?.Clearance_Hepatocyte_AZ },
        { property: 'Clearance Microsome', idealRange: [0, 100], value: predictionResult?.Clearance_Microsome_AZ },
      ],
      'Toxicity': [
        { property: 'LD50 (Zhu)', idealRange: [0, 100], value: predictionResult?.LD50_Zhu }, // Higher values indicate lower toxicity; > 1000 mg/kg is generally considered safe.
        { property: 'hERG Blockers', idealRange: [0, 1], value: predictionResult?.hERG }, // Ideally 0 (not a blocker); higher values indicate greater risk of cardiotoxicity.
        { property: 'Ames Mutagenicity', idealRange: [0, 1], value: predictionResult?.AMES }, // Ideally 0 (not mutagenic); > 0 indicates mutagenic potential.
        { property: 'Drug Ind LivInj', idealRange: [0, 1], value: predictionResult?.DILI }, // Ideally 0 (not causing liver injury); > 0 indicates potential risk.
        { property: 'Carcinogens', idealRange: [0, 1], value: predictionResult?.Carcinogens_Lagunin }, // Ideally 0 (not carcinogenic); > 0 indicates carcinogenic potential.
        { property: 'Clintox', idealRange: [0, 1], value: predictionResult?.ClinTox }, // Ideally 0 (non-toxic); > 0 indicates potential toxicity.

        { property: 'NR-AR-LBD', idealRange: [0, 1], value: predictionResult?.['NR-AR-LBD'] }, // Ideally 0 (no binding); higher values indicate potential androgen receptor activation.
        { property: 'NR-AR', idealRange: [0, 1], value: predictionResult?.['NR-AR'] }, // Ideally 0 (no activity); higher values indicate androgen receptor activity.
        { property: 'NR-AhR', idealRange: [0, 1], value: predictionResult?.['NR-AhR'] }, // Ideally 0 (no activity); higher values indicate aryl hydrocarbon receptor activity.
        { property: 'Nuclear Aromatase', idealRange: [0, 1], value: predictionResult?.['NR-Aromatase'] }, // Ideally 0 (no activity); higher values indicate aromatase inhibition.
        { property: 'NR-ER-LBD', idealRange: [0, 1], value: predictionResult?.['NR-ER-LBD'] }, // Ideally 0 (no binding); higher values indicate estrogen receptor binding.
        { property: 'NR-ER', idealRange: [0, 1], value: predictionResult?.['NR-ER'] }, // Ideally 0 (no activity); higher values indicate estrogen receptor activity.
        { property: 'NR-PPAR-gamma', idealRange: [0, 1], value: predictionResult?.['NR-PPAR-gamma'] }, // Ideally 0 (no activity); higher values indicate PPAR-gamma activity.
        { property: 'SR-ARE', idealRange: [0, 1], value: predictionResult?.['SR-ARE'] }, // Ideally 0 (no activity); higher values indicate ARE activity.
        { property: 'SR-ATAD5', idealRange: [0, 1], value: predictionResult?.['SR-ATAD5'] }, // Ideally 0 (no activity); higher values indicate ATAD5 activity.
        { property: 'SR-HSE', idealRange: [0, 1], value: predictionResult?.['SR-HSE'] }, // Ideally 0 (no activity); higher values indicate heat shock factor activation.
        { property: 'SR-MMP', idealRange: [0, 1], value: predictionResult?.['SR-MMP'] }, // Ideally 0 (no activity); higher values indicate MMP activity.
        { property: 'SR-P53', idealRange: [0, 1], value: predictionResult?.['SR-p53'] }, // Ideally 0 (no activity); higher values indicate p53 pathway activation.
        { property: 'Skin Rxn', idealRange: [0, 1], value: predictionResult?.Skin_Reaction }, // Ideally 0 (no skin reactions); higher values indicate potential skin toxicity.
      ],

    };
    return dataMapping[category] || [];
  };

  // Set the active category to 'Physicochemical Properties'
  const activeCat = 'Physicochemical Properties';

  const categoryData = getCategoryData(activeCat);

  const
    showTooltip = (index) => {
      const tooltip = document.getElementById(`msg-tooltip-${index}`);
      // tooltip.style.visibility = 'visible';
    };

  const hideTooltip = (index) => {
    const tooltip = document.getElementById(`msg-tooltip-${index}`);
    // tooltip.style.visibility = 'hidden';
  };

  const allCategoriesData = Object.keys(checkedCategories)
    .filter((category) => checkedCategories[category])
    .map((category) => ({
      name: category,
      data: getCategoryData(category)
    }))



  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    const updatedCheckedCategories = Object.keys(checkedCategories).reduce((acc, category) => {
      acc[category] = !selectAll || category === 'Physicochemical Properties';
      return acc;
    }, {});
    setCheckedCategories(updatedCheckedCategories);
  };



  const initRadarChart = () => {
    const chartDom = document.getElementById('radar-chart');
    const myChart = echarts.init(chartDom);
  
    // Create data for the lower and upper limits of the ideal range
    const lowerLimitData = categoryData.map(item => item.idealRange[0]);
    const upperLimitData = categoryData.map(item => item.idealRange[1]);
  
    const option = {
      tooltip: {},
      legend: {
        data: ['Ideal Range'],
        top: 'bottom', // Move legend to the bottom
        padding: [10, 10, 30, 10], // Add padding between the chart and legend
        textStyle: {
          color: '#333', // Set legend text color to dark
        },
      },
      radar: {
        indicator: categoryData.map(item => ({
          name: item.property,
          max: Math.max(item.idealRange[1], item.value),
          min: Math.min(item.idealRange[0], item.value),
        })),
        name: {
          textStyle: {
            color: '#333', // Set radar indicator text color to dark
          },
        },
        splitArea: {
          areaStyle: {
            color: ['#ffffff', '#E5E9EC', '#E5E9EC', '#E5E9EC'],
          },
        },
        splitLine: {
          lineStyle: {
            color: ['#CFD8DC', '#CFD8DC', '#CFD8DC', '#CFD8DC'],
          },
        },
        axisLine: {
          lineStyle: {
            color: '#CFD8DC',
          },
        },
      },
      series: [
        {
          name: 'Actual Values',
          type: 'radar',
          data: [{
            value: categoryData.map(item => item.value),
            name: 'Actual Values',
            // Adding the areaStyle to fill the inside of the radar chart
            areaStyle: {
              opacity: 0.7,  // Fill opacity (0 is transparent, 1 is solid)
              color: '#CEC7F0',  // Fill color (red with some transparency)
            },
            lineStyle: {
              color: '#855CF8', // Line color for actual values (red)
              width: 2,
            },
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {
              color: '#607D8B',
            },
          }],
        },
      ],
    };
  
    myChart.setOption(option);
  };
  
  
  // Call the function when categoryData changes
  useEffect(() => {
    initRadarChart();
  }, [categoryData]);
  


  const handleCopySmiles = () => {
    navigator.clipboard.writeText(smileString)
      .then(() => {
        toast.success('SMILES string copied to clipboard!', {
          className: 'mt-[59%]'
        });
      })
      .catch((error) => {
        toast.error('Failed to copy SMILES string to clipboard.', {
          className: 'mt-[59%]'
        });
        console.error('Failed to copy SMILES string:', error);
      });
  };
  

  let hoverToastId; // To track the hover toast ID

  const handleHoverCopyIcon = () => {
    hoverToastId = toast.info('Copy SMILES String', {
      className: 'mt-[62%]',
      autoClose: false, // Prevents automatic closing
      closeOnClick: false, // Disable closing on click
    });
  };
  
  const handleMouseLeave = () => {
    if (hoverToastId) {
      toast.dismiss(hoverToastId); // Dismiss the hover toast when the mouse leaves
    }
  };
  

  return (
    <>
      <div className="py-4 md:py-8 lg:py-12 h-screen ">
        <div className="bg-[#F4F4F4] p-4 md:p-6 lg:p-8 rounded-lg mt-3 flex flex-col h-screen">
          <div className="flex-grow w-full md:w-64 max-w-sm">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col w-full md:w-64 max-w-sm">
                <div className="flex flex-col md:flex-row items-center">
                  <input
                    type='checkbox'
                    className='font-segoe font-semibold text-sm leading-[19px]'
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <span className='pl-2 md:pl-4 text-[#A0AEC0]'>Select All</span>
                </div>

                <div className="first-check-box flex flex-col bg-[#FFFFFF] mb-4 mt-1 w-full md:w-64 h-auto md:h-62 border border-gray-200 p-4 md:p-6 lg:p-8 rounded-md">
                  {Object.keys(checkedCategories).map((category, index) => (
                    <React.Fragment key={category}>
                      <div className="flex mt-1">
                        <input
                          type="checkbox"
                          id={category.toLowerCase().replace(' ', '-')}
                          checked={checkedCategories[category]}
                          onChange={() => handleCategorySelection(category)}
                        />
                        <button
                          className={`text-left pl-1 text-gray-500 whitespace-nowrap ${checkedCategories[category] ? 'font-segoe text-gray-700 font-normal font-semibold' : 'opacity-50'}`}
                          onClick={() => handleCategorySelection(category)}
                        >
                          {category}
                        </button>
                      </div>
                      {index < Object.keys(checkedCategories).length - 1 && (
                        <hr className="mt-1 border-gray-300" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="mt-2 md:mt-4 lg:mt-6">
                  <button className="w-full md:w-64 h-8 md:h-10 lg:h-12 bg-[#3182CE] text-white rounded-lg flex items-center justify-center" onClick={downloadExcel}>
                    Download as CSV
                  </button>
                  <button className="mt-2 md:mt-4 lg:mt-6 w-full md:w-64 h-8 md:h-10 lg:h-12 bg-[#3182CE] text-white rounded-lg flex items-center justify-center" onClick={downloadPDF}>
                    Download as PDF
                  </button>
                </div>
              </div>


              <div className="values-table" onClick={onClose}>
                <div className="popup-content " onClick={(e) => e.stopPropagation()}>
                  <div style={{ maxHeight: '390px', overflowY: 'auto', overflowX: 'hidden' }}>
                    <table className="table-auto border-2 border-[DDDDDD] shadow-sm bg-[#DDDDDD]" style={{ textAlign: 'left', borderCollapse: 'collapse', width: '411px' }}>
                      {allCategoriesData.map((category, catIndex) => (
                        <React.Fragment key={catIndex}>
                          <thead className="text-xl flex font-segoe t-heading text-[#2D3748] bg-[#DDDDDD] font-bold mb-3 px-3 whitespace-nowrap"> {/* Changed header bg color */}
                            <tr>
                              <th colSpan="1" className="whitespace-nowrap">{category.name}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.data.map(({ property, idealRange, value }, index) => (
                              <tr key={property} className={index % 2 !== 0 ? 'bg-[#EFEFEF]' : 'bg-[#FFFFFFBA]'} style={{ height: '40px' }}>
                                <td className="opacity-75 px-4">{property}</td>
                                <td className="p-2 flex justify-between items-center" style={{ color: isValueOutOfRange(value, idealRange) ? 'red' : 'inherit' }}>
                                  {value ? value.toFixed(3) : 'N/A'} {/* Check if value exists before calling toFixed(3) */}
                                  <div className="icons-container flex items-center">
                                    {isValueOutOfRange(value, idealRange) ? (
                                      <Tooltip idealRange={idealRange} color="bg-[#E53E3E]">
                                        <CiWarning className="text-[#E53E3E] w-5 h-5 ml-6 cursor-pointer hover:text-red-700 hover:scale-110 transition-transform duration-300" />
                                      </Tooltip>
                                    ) : (
                                      <Tooltip idealRange={idealRange} color="bg-gray-700">
                                        <IoInformationCircle className="text-blue-500 w-5 h-5 ml-6 cursor-pointer hover:text-blue-700 hover:scale-110 transition-transform duration-300" />
                                      </Tooltip>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </React.Fragment>
                      ))}
                    </table>


                  </div>
                  <button onClick={handleViewAll}>
                    <img className="h-[20px] w-[20px]  full-screen" src="https://cdn-icons-png.flaticon.com/128/3876/3876090.png" />
                  </button>
                </div>
              </div>
              <div className=" bg-white rounded-lg mt-4 md:mt-0 md:ml-4 lg:ml-12">
                <div className="bg-white flex items-end justify-end w-full h-auto md:h-52 rounded-lg">
                <div className="w-full px-4 md:w-96 h-auto md:h-100 flex flex-col justify-between p-2 md:p-4 lg:p-6 rounded-lg" style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
    <IoCopyOutline
      onClick={handleCopySmiles}
      onMouseEnter={handleHoverCopyIcon}
      onMouseLeave={handleMouseLeave}
      className="copy-icon text-gray-500 cursor-pointer hover:text-gray-700 ml-auto"
      size={20}
    />
    <button className="w-full h-72 md:h-40 lg:h-72 rounded-lg mt-2 cursor-pointer border-2 border-[#3182CE]">
      <div ref={smilesRef} className="flex flex-col items-center h-72 lg:h-72 md:h-40" />
    </button>
  </div>
                </div>
                <div id="radar-chart" className='mt-6' style={{ width: '100%', height: 400 }}></div>
              </div>
            </div>
          </div>
        </div>
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <PropertiesTable
            onClose={handleCloseModal}
            firstHalf={firstHalf}
            secondHalf={secondHalf}
            predictionResult={predictionResult}
            smileString={smileString}
            projectName={projectName}
            allCategoriesData={allCategoriesData}

          />
        </Modal>
      </div>
    </>
  );
};

export default AdmetResultPage;
