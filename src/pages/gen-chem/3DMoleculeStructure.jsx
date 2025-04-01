import React, { useState, useRef, useEffect } from 'react';
import '3dmol/build/3Dmol.js';
 
const MoleculeStructure = () => {
  const [smiles, setSmiles] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMoleculeView, setShowMoleculeView] = useState(false);
  const [showInput, setShowInput] = useState(true);
 
  const handleDownload = async () => {
    if (!smiles.trim()) {
      setError('Please enter a valid SMILES string');
      return;
    }
 
    setError('');
    setLoading(true);
 
    try {
      const response = await fetch(
        'https://caitspringclusterapi-dev-genchem-ai-workflow-api.azuremicroservices.io/api/genchem/generate-pdb',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            smiles: [smiles],
          }),
        }
      );
 
      if (!response.ok) {
        throw new Error('Failed to generate the file');
      }
 
      // Convert the response to a blob (ZIP file)
      const blob = await response.blob();
 
      // Create a link to download the ZIP file
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'molecules.zip'); // Name of the downloaded ZIP file
      document.body.appendChild(link);
      link.click();
 
      // Cleanup the link
      link.parentNode.removeChild(link);
 
      // Show the molecule viewer and hide input
      setShowMoleculeView(true);
      setShowInput(false);
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
 
  const handleShowInput = () => {
    setShowMoleculeView(false);
    setShowInput(true);
    setSmiles(''); // Optionally clear the input
  };
 
  return (
    <div className="flex flex-col items-center justify-center  p-4 ">
      {showInput && (
        <>
          <h1 className="text-2xl font-bold mb-4 pt-12 text-[#735AA7]">Generate Molecules from SMILES</h1>
 
          <input
            type="text"
            placeholder="Enter SMILES string"
            className="w-full max-w-md p-2 border border-gray-300 rounded mb-4"
            value={smiles}
            onChange={(e) => setSmiles(e.target.value)}
          />
 
          {error && <p className="text-red-500 mb-4">{error}</p>}
 
          <button
            onClick={handleDownload}
            className={`bg-[#735AA7] text-white font-bold py-2 px-4 rounded hover:bg-[#624593] transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate '}
          </button>
        </>
      )}
 
      {showMoleculeView && (
        <>
          <MoleculeFileUploader onClear={() => { setShowMoleculeView(false); setShowInput(true); }} />
          <button
            onClick={handleShowInput}
            className="bg-[#735AA7] text-white font-bold py-2 px-4 rounded hover:bg-[#624593] transition mt-4"
          >
            Back to SMILES Input
          </button>
        </>
      )}
    </div>
  );
};
 
const MoleculeFileUploader = ({ onClear }) => {
  const [fileContents, setFileContents] = useState([]);
 
  const handleFileUpload = (event) => {
    const files = event.target.files;
    const fileReaders = [];
 
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          console.log(`File content loaded from ${file.name}:`, content);
          setFileContents((prevContents) => [...prevContents, content]);
        };
        fileReaders.push(reader.readAsText(file));
      }
    }
 
    if (fileReaders.length === 0) {
      console.log('No files selected');
    }
  };
 
  const handleClear = () => {
    setFileContents([]); // Clear file contents
    onClear(); // Call the clear handler from props
  };
 
  return (
    <div className="mt-2">
      <h1 className="text-2xl font-bold text-[#735AA7] mb-4">3D Molecule Viewer</h1>
      <input
        type="file"
        accept=".pdb,.sdf,.mol2,.xyz,.cube"
        multiple
        className="mb-4"
        onChange={handleFileUpload}
      />
      {fileContents.length > 0 && <MoleculeViewer moleculeDataList={fileContents} />}
      <button
        onClick={handleClear}
        className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition mt-4"
      >
        Clear
      </button>
    </div>
  );
};
 
const MoleculeViewer = ({ moleculeDataList }) => {
  const viewerRef = useRef(null);
  const viewerInstance = useRef(null); // Store the viewer instance here
  const [selectedAtomType, setSelectedAtomType] = useState('C');
  const [selectedStyle, setSelectedStyle] = useState('stick');
 
  useEffect(() => {
    if (!moleculeDataList || moleculeDataList.length === 0) {
      console.log('No molecule data provided');
      return;
    }
 
    import('3dmol/build/3Dmol.js').then(($3Dmol) => {
      viewerInstance.current = window.$3Dmol.createViewer(viewerRef.current, { backgroundColor: 'white' });
      viewerInstance.current.clear();
 
      try {
        moleculeDataList.forEach((moleculeData, index) => {
          console.log('Adding model with data:', moleculeData);
          const format = moleculeData.includes('CONECT') ? 'pdb' : 'sdf';
          const color = getColorForModel(index); // Get a unique color for the model
          const model = viewerInstance.current.addModel(moleculeData, format);
          viewerInstance.current.setStyle({ model: model }, { [selectedStyle]: { radius: 0.09, color: color } });
        });
 
        viewerInstance.current.setBackgroundColor('white');
        viewerInstance.current.zoomTo();
        viewerInstance.current.render();
        console.log('Molecules rendered successfully');
 
        // Highlight selected atom type
        highlightAtomType(selectedAtomType);
      } catch (error) {
        console.error('Error rendering molecules:', error);
      }
    }).catch((err) => console.error('Error loading 3Dmol.js:', err));
  }, [moleculeDataList, selectedStyle]);
 
  useEffect(() => {
    if (viewerInstance.current) {
      highlightAtomType(selectedAtomType);
    }
  }, [selectedAtomType]);
 
  const highlightAtomType = (atomType) => {
    viewerInstance.current.setStyle({ element: atomType }, { sphere: { radius: 0.5, color: 'orange' } });
    viewerInstance.current.render();
    console.log(`Highlighted atoms of type: ${atomType}`);
  };
 
  const getColorForModel = (index) => {
    const colors = ['red', 'green', 'blue', 'yellow'];
    return colors[index % colors.length]; // Cycle through colors based on index
  };
 
  return (
    <div>
      <div ref={viewerRef} style={{ width: '800px', height: '800px' }}></div>
      <div>
        {/* <h2 className="text-xl font-semibold text-[#735AA7] mt-4">Select Atom Type</h2>
        <select
          value={selectedAtomType}
          onChange={(e) => setSelectedAtomType(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="C">Carbon (C)</option>
          <option value="H">Hydrogen (H)</option>
          <option value="O">Oxygen (O)</option>
          <option value="N">Nitrogen (N)</option>
        </select> */}
      </div>
      <div>
        <h2 className="text-xl font-semibold text-[#735AA7] mt-4">Select Visualization Style</h2>
        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="stick">Stick</option>
          <option value="sphere">Sphere</option>
          <option value="cartoon">Cartoon</option>
        </select>
      </div>
    </div>
  );
};
 
export default MoleculeStructure;
 
 