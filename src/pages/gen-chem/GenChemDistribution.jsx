// import React, { useState, useEffect } from 'react';
// import * as echarts from 'echarts';
// import Loader from '../../components/Loader'; // Ensure you have a Loader component

// const properties = [
//   { name: 'Molecular Weight', key: 'molecularWeight' },
//   { name: 'Volume', key: 'volume' },
//   { name: 'Density', key: 'density' },
//   { name: 'Hydrogen Bond Acceptors', key: 'hydrogenBondAcceptors' },
//   { name: 'Hydrogen Bond Donors', key: 'hydrogenBondDonors' },
//   { name: 'Rotatable Bonds', key: 'rotatableBonds' },
//   { name: 'Rings', key: 'rings' },
//   { name: 'Max Ring Size', key: 'maxRingSize' },
//   { name: 'Heteroatoms', key: 'heteroatoms' },
//   { name: 'LogP', key: 'logP' },
//   { name: 'Formal Charge', key: 'formalCharge' },
//   { name: 'Flexibility', key: 'flexibility' },
//   { name: 'Stereocenters', key: 'stereocenters' },
//   { name: 'Topological Polar Surface Area', key: 'topologicalPolarSurfaceArea' },
//   { name: 'Fraction of Sp3', key: 'fractionOfSp3' },
// ];

// const GenChemDistribution = () => {
//   const [responseData, setResponseData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const handleFileUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const formData = new FormData();
//     formData.append('input_SMILES', file);

//     setLoading(true); // Show loader before API call

//     try {
//       const response = await fetch(
//         'https://caitspringclusterapi-dev-genchem-ai-workflow-api.azuremicroservices.io/api/genchem/distribution',
//         {
//           method: 'POST',
//           body: formData,
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Error: ${response.statusText}`);
//       }

//       const data = await response.json();
//       setResponseData(data); // Store the response for chart rendering
//     } catch (error) {
//       console.error('Error uploading file:', error);
//     } finally {
//       setLoading(false); // Hide loader after API response
//     }
//   };

//   useEffect(() => {
//     if (responseData.length > 0) {
//       // Loop through each property and create a chart
//       properties.forEach((property, index) => {
//         const chartDom = document.getElementById(`chart-${index}`);
//         const myChart = echarts.init(chartDom);

//         const propertyData = responseData.map((item) => item[property.key]);

//         // Compute histogram bins (you can adjust the bin size as needed)
//         const binCount = 20; // Example bin count
//         const min = Math.min(...propertyData);
//         const max = Math.max(...propertyData);
//         const binSize = (max - min) / binCount;

//         const bins = new Array(binCount).fill(0);
//         propertyData.forEach((value) => {
//           const binIndex = Math.min(
//             Math.floor((value - min) / binSize),
//             binCount - 1
//           );
//           bins[binIndex]++;
//         });

//         // X-axis values for the bins
//         const xAxisBins = bins.map((_, idx) => (min + idx * binSize).toFixed(2));

//         // Density curve (you can normalize the bin values for a smooth curve)
//         const density = bins.map((bin) => bin / (propertyData.length * binSize));

//         const option = {
//           title: {
//             text: `${property.name} Histogram & Density`,
//             left: 'center',
//             textStyle: {
//               fontSize: 16,
//               fontWeight: 'bold',
//               marginTop: 12,
//             },
//           },
//           tooltip: {
//             trigger: 'axis',
//             axisPointer: {
//               type: 'cross',
//             },
//           },
//           toolbox: {
//             feature: {
//               saveAsImage: { show: true },
//               dataZoom: { show: true },
//               restore: { show: true },
//             },
//             right: 10,
//           },
//           dataZoom: [
//             {
//               type: 'slider',
//               start: 0,
//               end: 100,
//               bottom: 30,
//             },
//           ],
//           xAxis: {
//             type: 'category',
//             data: xAxisBins,
//             axisLabel: {
//               rotate: 45,
//               fontSize: 10,
//             },
//             boundaryGap: true,
//             axisTick: { show: true },
//             axisLine: { onZero: true },
//           },
//           yAxis: [
//             {
//               type: 'value',
//               name: 'Frequency',
//               axisLabel: {
//                 fontSize: 12,
//               },
//             },
//             {
//               type: 'value',
//               name: 'Density',
//               axisLabel: {
//                 fontSize: 12,
//               },
//               opposite: true,
//             },
//           ],
//           series: [
//             {
//               name: 'Frequency',
//               type: 'bar',
//               data: bins,
//               itemStyle: {
//                 color: '#73C0DE',
//               },
//               smooth: true,
//               emphasis: {
//                 focus: 'series',
//               },
//             },
//             {
//               name: 'Density',
//               type: 'line',
//               yAxisIndex: 1,
//               data: density,
//               itemStyle: {
//                 color: '#FF6F61',
//               },
//               smooth: true,
//               emphasis: {
//                 focus: 'series',
//               },
//               lineStyle: {
//                 width: 2,
//               },
//             },
//           ],
//         };

//         myChart.setOption(option);
//       });
//     }
//   }, [responseData]);

//   return (
//     <div className="min-h-screen bg-gray-100 p-10">
//       <div className="border-2 border-[#735AA7] rounded-lg pt-4">
//         <h2 className="text-center text-2xl font-bold text-gray-800">
//           GenChem Distribution Analysis
//         </h2>

//         <div className="flex justify-center py-12">
//           <label className="block cursor-pointer">
//             <span className="text-md font-normal font-semibold bg-[#8D6CBB] text-white mt-4 py-2 px-4 rounded shadow-lg hover:bg-[#735AA7] transition">
//               Upload SMILES File
//             </span>
//             <input
//               type="file"
//               onChange={handleFileUpload}
//               className="hidden"
//             />
//           </label>
//         </div>
//       </div>

//       {loading && (
//         <div className="flex justify-center mt-4">
//           <Loader /> {/* Replace with your Loader component */}
//         </div>
//       )}

//       <div className="grid grid-cols-1 mt-6 sm:grid-cols-2 lg:grid-cols-2 gap-6">
//         {properties.map((property, index) => (
//           <div
//             key={index}
//             id={`chart-${index}`}
//             className="bg-white shadow-lg rounded-lg p-4"
//             style={{ width: '100%', height: '400px' }}
//           ></div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default GenChemDistribution;




import React, { useState, useEffect } from 'react';
import * as echarts from 'echarts';
import Loader from '../../components/Loader'; // Ensure you have a Loader component

const properties = [
  { name: 'Molecular Weight', key: 'molecularWeight' },
  { name: 'Volume', key: 'volume' },
  { name: 'Density', key: 'density' },
  { name: 'Hydrogen Bond Acceptors', key: 'hydrogenBondAcceptors' },
  { name: 'Hydrogen Bond Donors', key: 'hydrogenBondDonors' },
  { name: 'Rotatable Bonds', key: 'rotatableBonds' },
  { name: 'Rings', key: 'rings' },
  { name: 'Max Ring Size', key: 'maxRingSize' },
  { name: 'Heteroatoms', key: 'heteroatoms' },
  { name: 'LogP', key: 'logP' },
  { name: 'Formal Charge', key: 'formalCharge' },
  { name: 'Flexibility', key: 'flexibility' },
  { name: 'Stereocenters', key: 'stereocenters' },
  { name: 'Topological Polar Surface Area', key: 'topologicalPolarSurfaceArea' },
  { name: 'Fraction of Sp3', key: 'fractionOfSp3' },
];

const GenChemDistribution = () => {
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null);
  const [pcaImageUrl, setPcaImageUrl] = useState(null);
  const [heatmapImageUrl, setHeatmapImageUrl] = useState(null);
  const [loadingPCA, setLoadingPCA] = useState(false);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
 
  // Handle file upload
//   const handleFileUpload = (event) => {

//   };
 
  // API call to generate PCA plot
  const handleGeneratePCA = async () => {
    if (!file) {
      alert('Please upload a file before generating.');
      return;
    }
 
    const formData = new FormData();
    formData.append('input_SMILES', file);
 
    try {
      setLoadingPCA(true);
 
      const response = await fetch('https://caitspringclusterapi-dev-genchem-ai-workflow-api.azuremicroservices.io/api/genchem/pca-plot', {
        method: 'POST',
        body: formData,
      });
 
      if (!response.ok) {
        throw new Error('Failed to generate PCA plot. Please check the file and try again.');
      }
 
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPcaImageUrl(url);
 
      setLoadingPCA(false);
    } catch (error) {
      console.error('Error generating PCA plot:', error);
      setLoadingPCA(false);
      alert(error.message);
    }
  };
 
  // API call to generate Similarity Heatmap
  const handleGenerateHeatmap = async () => {
    if (!file) {
      alert('Please upload a file before generating.');
      return;
    }
 
    const formData = new FormData();
    formData.append('input_SMILES', file);
 
    try {
      setLoadingHeatmap(true);
 
      const response = await fetch('https://caitspringclusterapi-dev-genchem-ai-workflow-api.azuremicroservices.io/api/genchem/similarity-heatmap', {
        method: 'POST',
        body: formData,
      });
 
      if (!response.ok) {
        throw new Error('Failed to generate similarity heatmap. Please check the file and try again.');
      }
 
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setHeatmapImageUrl(url);
 
      setLoadingHeatmap(false);
    } catch (error) {
      console.error('Error generating similarity heatmap:', error);
      setLoadingHeatmap(false);
      alert(error.message);
    }
  };
 

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('input_SMILES', file);

    setLoading(true); // Show loader before API call

    try {
      const response = await fetch(
        'https://caitspringclusterapi-dev-genchem-ai-workflow-api.azuremicroservices.io/api/genchem/distribution',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResponseData(data); // Store the response for chart rendering
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false); // Hide loader after API response
    }
  };

  useEffect(() => {
    if (responseData.length > 0) {
      // Loop through each property and create a chart
      properties.forEach((property, index) => {
        const chartDom = document.getElementById(`chart-${index}`);
        const myChart = echarts.init(chartDom);

        const option = {
          title: {
            text: `${property.name} vs SMILES`,
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 'bold',
              marginTop:12
            },
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          toolbox: {
            feature: {
              saveAsImage: { show: true },
              dataZoom: { show: true },
              restore: { show: true },
            },
            right: 10, // Position toolbox to the right
          },
          dataZoom: [
            {
              type: 'slider',
              start: 0,
              end: 100,
              bottom: 30, // Move the dataZoom slider down to avoid overlapping
            },
          ],
          xAxis: {
            type: 'category',
            data: responseData.map((item) => item.smiles),
            axisLabel: {
              rotate: 45,
              fontSize: 10,
            },
            // Add padding to avoid overlapping with the slider
            boundaryGap: true,
            axisTick: { show: true },
            axisLine: { onZero: true },
            splitLine: { show: false }, // Optional: Hide grid lines for cleaner look
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              fontSize: 12,
            },
          },
          series: [
            {
              name: property.name,
              type: 'bar',
              data: responseData.map((item) => item[property.key]),
              itemStyle: {
                color: '#73C0DE',
              },
              smooth: true,
              emphasis: {
                focus: 'series',
              },
            },
          ],
        };

        myChart.setOption(option);
      });
    }
  }, [responseData]);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
         <div className=" flex flex-col items-center justify-center bg-gray-100 p-8">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center text-green-600 mb-6">PCA Plot & Similarity Heatmap Generator</h1>
 
        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-700">Upload your file</label>
          <input
            type="file"
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-green-500"
            onChange={handleFileUpload}
          />
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PCA Plot section */}
          <div className="flex flex-col items-center">
            <button
              className={`w-full px-4 py-2 bg-green-500 text-white rounded-md mb-4 ${loadingPCA ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
              onClick={handleGeneratePCA}
              disabled={loadingPCA}
            >
              {loadingPCA ? 'Generating PCA Plot...' : 'Generate PCA Plot'}
            </button>
 
            {pcaImageUrl && (
              <div className="w-full h-auto">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">PCA Plot</h2>
                <img src={pcaImageUrl} alt="PCA Plot" className="w-full h-auto border border-gray-300 rounded-lg" />
              </div>
            )}
          </div>
 
          {/* Similarity Heatmap section */}
          <div className="flex flex-col items-center">
            <button
              className={`w-full px-4 py-2 bg-green-500 text-white rounded-md mb-4 ${loadingHeatmap ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
              onClick={handleGenerateHeatmap}
              disabled={loadingHeatmap}
            >
              {loadingHeatmap ? 'Generating Similarity Heatmap...' : 'Generate Similarity Heatmap'}
            </button>
 
            {heatmapImageUrl && (
              <div className="w-full h-auto">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Similarity Heatmap</h2>
                <img src={heatmapImageUrl} alt="Similarity Heatmap" className="w-full h-auto border border-gray-300 rounded-lg" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
 
        <div className='border-2 border-[#735AA7] rounded-lg pt-4'>
        <h2 className="text-center text-2xl font-semibold text-gray-800 ">GenChem Distribution Analysis</h2>
      
      <div className="flex justify-center py-12">
        <label className="block cursor-pointer">
          <span className="text-md font-normal font-semibold bg-[#8D6CBB] text-white mt-4 py-2 px-4 rounded shadow-lg hover:bg-[#735AA7] transition">
            Upload SMILES File
          </span>
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
        </div>

      {loading && (
        <div className="flex justify-center mt-4">
          <Loader /> {/* Replace with your Loader component */}
        </div>
      )}

      <div className="grid grid-cols-1 mt-6 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Generate 15 divs, one for each chart */}
        {properties.map((property, index) => (
          <div
            key={index}
            id={`chart-${index}`}
            className="bg-white shadow-lg rounded-lg p-4"
            style={{ width: '100%', height: '400px' }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default GenChemDistribution;
