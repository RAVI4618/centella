
import React, { useRef, useEffect } from 'react';
import SmilesDrawer from 'smiles-drawer';
import { useMsal } from "@azure/msal-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable'
import * as echarts from 'echarts';  // Import Echarts 
import '../../styles/components.css' 
import { IoCopyOutline } from 'react-icons/io5';
import { toast } from 'sonner';



const PropertiesTable = ({ projectName, smileString, predictionResult, firstHalf, secondHalf, onClose }) => {
  const smilesRef = useRef(null);
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  const userId = `${activeAccount?.name}`;
  const chartRef = useRef(null)

  useEffect(() => {
    if (smileString && smilesRef.current) {
      smilesRef.current.innerHTML = '';
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      smilesRef.current.appendChild(canvas);

      const options = { width: 400, height: 400, bondThickness: 1 };
      const smilesDrawer = new SmilesDrawer.Drawer(options);

      SmilesDrawer.parse(smileString, (tree) => {
        smilesDrawer.draw(tree, canvas, 'light', false);
      }, (err) => {
        console.error('Error parsing SMILES string:', err);
      });
    }
  }, [smileString]);

useEffect(() => {
  if (predictionResult) {
    // Initialize radar chart
    const chart = echarts.init(chartRef.current);

    // Radar data based on the prediction result
    const radarData = [
      { name: 'logP', value: predictionResult?.logP || 0, idealRange: [0, 5] },
      { name: 'Mol wt', value: predictionResult?.molecular_weight || 0, idealRange: [200, 500] },
      { name: 'nHA', value: predictionResult?.hydrogen_bond_acceptors || 0, idealRange: [0, 10] },
      { name: 'nHD', value: predictionResult?.hydrogen_bond_donors || 0, idealRange: [0, 5] },
      { name: 'Lipinski', value: predictionResult?.Lipinski || 0, idealRange: [0, 5] },
      { name: 'QED', value: predictionResult?.QED || 0, idealRange: [0, 5] },
    ];

    // Ideal range data for radar chart
    const lowerLimitData = radarData.map(item => item.idealRange[0]);
    const upperLimitData = radarData.map(item => item.idealRange[1]);

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
        indicator: radarData.map(item => ({
          name: item.name,
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
            color: ['#ffffff', '#E5E9EC', '#E5E9EC', '#E5E9EC'], // Custom background colors
          },
        },
        splitLine: {
          lineStyle: {
            color: ['#CFD8DC', '#CFD8DC', '#CFD8DC', '#CFD8DC'], // Custom split line color
          },
        },
        axisLine: {
          lineStyle: {
            color: '#CFD8DC', // Axis line color
          },
        },
      },
      series: [
        {
          name: 'Actual Values',
          type: 'radar',
          data: [
            {
              value: radarData.map(item => item.value),
              name: 'Actual Values',
              // Adding the areaStyle to fill the inside of the radar chart
              areaStyle: {
                opacity: 0.7, // Fill opacity (0 is transparent, 1 is solid)
                color: '#CEC7F0', // Fill color with transparency
              },
              lineStyle: {
                color: '#855CF8', // Line color for actual values
                width: 2,
              },
              symbol: 'circle',
              symbolSize: 6,
              itemStyle: {
                color: '#607D8B', // Color for actual value points
              },
            },
          ],
        },
      ],
    };

    // Render the chart
    chart.setOption(option);

    // Clean up the chart when the component is unmounted
    return () => {
      chart.dispose();
    };
  }
}, [predictionResult]);



  const downloadPDF = async () => {
    const pdf = new jsPDF();
    let y = 10;

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
      const logoWidth = 10;
      const logoHeight = 12;
      pdf.addImage(logoImage, 'PNG', pdf.internal.pageSize.width - logoWidth - 10, y, logoWidth, logoHeight);
      y += logoHeight + 5;
    } catch (error) {
      console.error('Error loading logo image:', error);
    }

    pdf.text(`Project Name: ADMET`, 10, y);
    y += 10;

    const canvas = smilesRef.current.querySelector('canvas');
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, y, 50, 50); // Adjust the size and position as needed
    y += 60;

    pdf.setFontSize(10);
    pdf.text(`SMILE: ${firstHalf}${secondHalf}`, 10, y);
    y += 10;

    const userIdWidth = pdf.getStringUnitWidth(`User ID: ${userId}`) * pdf.internal.scaleFactor;
    const underlineLength = 180;
    pdf.line(10, y + 5, 10 + underlineLength, y + 5);
    y += 10;

    Object.keys(categories).forEach(category => {
      pdf.text(category, 10, y);
      y += 10;

      const tableData = categories[category].map(name => [name.name, name.value?.toFixed(3) || 'N/A', `${name.idealRange[0]} - ${name.idealRange[1]}`]);
      pdf.autoTable({
        startY: y,
        head: [['Property', 'Value', 'Ideal Range']],
        body: tableData,
      });

      y = pdf.autoTable.previous.finalY + 10;
    });

    pdf.save('admet_properties.pdf');
  };


  const handleBack = () => {
    onClose()
  }

  const categories = {
    'PHYSICO CHEMICAL PROPERTIES': [
      { name: 'logP', idealRange: [0, 5], value: predictionResult?.logP },
      { name: 'Mol wt', idealRange: [200, 500], value: predictionResult?.molecular_weight },
      { name: 'nHA', idealRange: [0, 10], value: predictionResult?.hydrogen_bond_acceptors },
      { name: 'nHD', idealRange: [0, 5], value: predictionResult?.hydrogen_bond_donors },
      { name: 'Lipinski', idealRange: [0, 5], value: predictionResult?.Lipinski },
      { name: 'QED', idealRange: [0, 5], value: predictionResult?.QED },
      { name: 'StereoCenters', idealRange: [0, 5], value: predictionResult?.stereo_centers_drugbank_approved_percentile },
      { name: 'HFE', idealRange: [0, 5], value: predictionResult?.HydrationFreeEnergy_FreeSolv },
    ],
    'ABSORPTION': [
      { name: 'Caco-2 Perm', idealRange: [5, 13], value: predictionResult?.Caco2_Wang_drugbank_approved_percentile },
      { name: 'HIA', idealRange: [70, 100], value: predictionResult?.HIA_Hou_drugbank_approved_percentile },
      { name: 'Oral Bio av', idealRange: [0, 100], value: predictionResult?.Bioavailability_Ma },
      { name: 'Lipophilicity', idealRange: [-3, 3], value: predictionResult?.Lipophilicity_AstraZeneca_drugbank_approved_percentile },
      { name: 'Aqua Solubility', idealRange: [-5, -1], value: predictionResult?.Solubility_AqSolDB_drugbank_approved_percentile },
      { name: 'Pgp Inhibitor', idealRange: [0, 100], value: predictionResult?.Pgp_Broccatelli_drugbank_approved_percentile },
    ],
    'DISTRIBUTION': [
      { name: 'PPB', idealRange: [0, 100], value: predictionResult?.PPBR_AZ },
      { name: 'Vol Dist', idealRange: [1, 5], value: predictionResult?.VDss_Lombardo },
      { name: 'PAMPA NCATS', idealRange: [0, 100], value: predictionResult?.PAMPA_NCATS_drugbank_approved_percentile },
      { name: 'BBB', idealRange: [0, 100], value: predictionResult?.BBB_Martins },
    ],
    'METABOLISM': [
      { name: 'CYP2D6 Inhib', idealRange: [0, 100], value: predictionResult?.CYP2D6_Substrate_CarbonMangels },
      { name: 'CYP3A4 Inhib', idealRange: [0, 100], value: predictionResult?.CYP3A4_Substrate_CarbonMangels },
      { name: 'CYP2C9 Inhib', idealRange: [0, 100], value: predictionResult?.CYP2C9_Veith },
      { name: 'CYP2D6 Sub', idealRange: [0, 100], value: predictionResult?.CYP2D6_Substrate_CarbonMangels },
      { name: 'CYP3A4 Sub', idealRange: [0, 100], value: predictionResult?.CYP3A4_Substrate_CarbonMangels },
      { name: 'CYP2C9 Sub', idealRange: [0, 100], value: predictionResult?.CYP2C9_Substrate_CarbonMangels },
      { name: 'CYP3A4 ', idealRange: [0, 100], value: predictionResult?.CYP3A4_Veith },
    ],
    'EXCRETION': [
      { name: 'Half-Life ', idealRange: [0, 100], value: predictionResult?.Half_Life_Obach_drugbank_approved_percentile },
      { name: 'Clr Hept', idealRange: [0, 100], value: predictionResult?.Clearance_Hepatocyte_AZ },
      { name: 'Clr Micro', idealRange: [0, 100], value: predictionResult?.Clearance_Microsome_AZ },
    ],
    'TOXICITY': [
      { name: 'LD50 (Zhu)', idealRange: [0, 100], value: predictionResult?.LD50_Zhu },
      { name: 'hERG Blockers', idealRange: [0, 100], value: predictionResult?.hERG },
      { name: 'Ames Mutagen', idealRange: [0, 100], value: predictionResult?.AMES },
      { name: 'Drug Ind LivInj', idealRange: [0, 100], value: predictionResult?.DILI },
      { name: 'Carcinogens', idealRange: [0, 100], value: predictionResult?.Carcinogens_Lagunin },
      { name: 'Clintox', idealRange: [0, 100], value: predictionResult?.ClinTox },
      { name: 'NR-AR-LBD', idealRange: [0, 100], value: predictionResult?.['NR-AR-LBD'] },
      { name: 'NR-AR', idealRange: [0, 100], value: predictionResult?.['NR-AR'] },
      { name: 'NR-AhR', idealRange: [0, 100], value: predictionResult?.['NR-AhR'] },
      { name: 'Nuclear Arom', idealRange: [0, 100], value: predictionResult?.['NR-Aromatase'] },
      { name: 'NR-ER-LBD', idealRange: [0, 100], value: predictionResult?.['NR-ER-LBD'] },
      { name: 'NR-ER', idealRange: [0, 100], value: predictionResult?.['NR-ER'] },
      { name: 'NR-PPARg', idealRange: [0, 100], value: predictionResult?.['NR-PPAR-gamma'] },
      { name: 'SR-ARE', idealRange: [0, 100], value: predictionResult?.['SR-ARE'] },
      { name: 'SR-ATAD5', idealRange: [0, 100], value: predictionResult?.['SR-ATAD5'] },
      { name: 'SR-HSE', idealRange: [0, 100], value: predictionResult?.['SR-HSE'] },
      { name: 'SR-MMP', idealRange: [0, 100], value: predictionResult?.['SR-MMP'] },
      { name: 'SR-P53', idealRange: [0, 100], value: predictionResult?.['SR-p53'] },
      { name: 'Skin Rxn', idealRange: [0, 100], value: predictionResult?.Skin_Reaction }
    ]
  };



  const isValueOutOfRange = (value, idealRange) => {
    if (!value || !idealRange || idealRange.length !== 2) return false;
    return value < idealRange[0] || value > idealRange[1];
  };


  // Function to copy SMILES string to clipboard
  const handleCopySmiles = () => {
    navigator.clipboard.writeText(smileString)
      .then(() => {
        toast.success('SMILES string copied to clipboard!', {
          className: 'relative mt-[152%] right-56'
        });
      })
      .catch((error) => {
        toast.error('Failed to copy SMILES string to clipboard.', {
          className: 'mt-[59%]'
        });
        console.error('Failed to copy SMILES string:', error);
      });
  };

  return (
    <>
      <div className=' w-full max-w-auto    pt-2 p-2 flex flex-wrap justify-between mx-auto'>
        <div className='flex  '>
          <div className='flex cursor-pointer '
            // onClick={() => navigate('/projects/projectdetails/1/routes')}
            onClick={handleBack}
          >
            <img src='https://cdn-icons-png.flaticon.com/128/3415/3415823.png' height={25} width={30} alt="Back Arrow" />
            <div className='mt-1 ml-2'>Back</div>
          </div>
        </div>
        <div className='flex items-center '>
          <div className='flex  '>
            <img className='mr-6 mt-1 cursor-pointer h-[20px] w-[20px]' src='https://cdn-icons-png.flaticon.com/128/1358/1358023.png' alt="share-icon" />
            <span className='mr-4 opacity-75'>|</span>
            <img className='mr-2 mt-1 cursor-pointer h-[20px] w-[20px]' src='https://cdn-icons-png.flaticon.com/128/13671/13671269.png ' onClick={downloadPDF} alt="PDF Icon" />
          </div>

        </div>


      </div>

      {/* smile string, structure and data graph containers */}
      <div className="string-structure-radarchart py-12 mt-4 bg-[#FFFFFF]  rounded-[30px] container flex flex-col items-start space-y-4 p-4 border-2 border-[#735DA8]">
        {/* SMILES Structure and Radar Chart Row */}
        <div className="flex flex-col md:flex-row justify-around items-center w-full space-y-4 md:space-y-0 md:space-x-4">
          {/* SMILES Structure */}
          <div className="smiles-structure-container relative bottom-12 h-80 w-80" ref={smilesRef}></div>
                {/* Copy Icon with hover and click functionality */}

          {/* Radar Chart */}
          <div className="radar-chart-container w-96 h-96" ref={chartRef}></div>
        </div>

{/* SMILES String and Copy Icon side by side */}
<div className="flex flex-row items-center w-full">
  <p className="smile-string text-start ml-6 font-segoe leading-[19px] font-bold">
    {smileString}
  </p>
  <IoCopyOutline
    onClick={handleCopySmiles} // Copy SMILES string on click
    className="copy-icon text-gray-500 cursor-pointer hover:text-gray-700 ml-6" // Adjusted margin for spacing
    size={20}
  />
</div>

      </div>
      
 <div className="grid grid-cols-2 gap-4 ">
  {Object.entries(categories).map(([categoryName, properties], idx) => (
    <div key={idx} className="border border-gray-300 mt-6 rounded-lg max-h-80">
      <h3 className="text-lg font-semibold rounded-lg mb-2 text-center bg-[#735AA7] py-2 text-[#FFFFFF] sticky ">
        {categoryName}
      </h3>
      <div className="max-h-60 overflow-y-scroll scrollbar-visible">
        <table className="min-w-full ">
          <tbody>
            {properties.map((prop, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}>
                <td className="p-2 text-dark font-semibold">{prop.name}</td>
                <td className={`p-2 text-dark font-semibold ${isValueOutOfRange(prop.value, prop.idealRange) ? 'text-red-600' : 'text-black'}`}>
                  {prop.value?.toFixed(3) || 'N/A'}
                </td>
                <td className="p-2 text-dark font-semibold">{`${prop.idealRange[0]} - ${prop.idealRange[1]}`}</td>
                <td className="p-2 text-dark font-semibold">
                  {isValueOutOfRange(prop.value, prop.idealRange) ? (
                    <img src="https://cdn-icons-png.flaticon.com/128/4201/4201973.png" height={20} width={20} alt="out of range" className="mr-4" />
                  ) : (
                    <img src="https://cdn-icons-png.flaticon.com/128/4315/4315445.png" height={15} width={15} alt="in range" className="mr-4" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ))}
</div>


    </>

  );
};

export default PropertiesTable;


