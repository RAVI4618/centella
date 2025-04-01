
import React, { useEffect, useState ,useRef} from "react";
import './../../styles/editor.css'
import { Link, useLocation } from "react-router-dom";
import { useAtom } from 'jotai';
import AdmetResultPage from '../../components/admet/AdmetResultPage';
import projData from '../../json/projects.json'
import { base_api_url, currentWorkflow, post_api_headers } from "../../utils/Store";
// import { toast } from "sonner";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../../components/Loader";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import { Editor } from "ketcher-react";
import "ketcher-react/dist/index.css";
import { RiDeleteBin5Line, RiDownload2Line } from 'react-icons/ri';
import RetroResultPage from "../../components/retro/RetroResultPage";


const structServiceProvider = new StandaloneStructServiceProvider();
const SmilePage1 = () => {
  const location = useLocation();
  const oid = location.pathname.split('/')[3]
  const projectDetails = projData.filter(e => e.id == oid)[0]
  const [currentWflow] = useAtom(currentWorkflow)
  const [smileString, setSmileString] = useState('');   //current smile string
  const [predictionResult, setPredictionResult] = useState(null);   //the result of the prediction API call
  const [showPredictButton, setShowPredictButton] = useState(false);   //controls the visibility of the predict button
  const [showPopup, setShowPopup] = useState(false);   //controls the visibility of the result popup
  const [activeTab, setActiveTab] = useState('smile');  //tracks which tab is active (smile,visual,upload)
  const [isPredictDisabled, setIsPredictDisabled] = useState(false);   //disables the predict button when neccessary
  const [loader, setLoader] = useState(false)  //Controls the visibility of the loader during API calls.
  const apiUrl = useAtom(base_api_url)[0]
  const postapi_header = useAtom(post_api_headers)[0]

  const resultRef = useRef(null); //for scrolling results automatically



  //for upload file smile string list
  const [showFileInput, setShowFileInput] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedSmiles, setExtractedSmiles] = useState('');   //to store the extracted smiles
  const [selectedSmile, setSelectedSmile] = useState('') // tp display structure for selected smile
  const [previousSelectedIndex, setPreviousSelectedIndex] = useState(null);
  const [checkedSmile, setCheckedSmile] = useState('') //to display result for the checked smile




  const handleCheckboxChange = (smile, index) => {
    const checkbox = document.getElementById(`smile_${index}`);
    if (checkbox) {
      // Uncheck previously selected checkbox
      if (previousSelectedIndex !== null) {
        const previousCheckbox = document.getElementById(`smile_${previousSelectedIndex}`);
        if (previousCheckbox) {
          previousCheckbox.checked = false;
        }
      }
      // Set smile string and update previous selected index
      setSelectedSmile(smile);
      setCheckedSmile(smile)
      setPreviousSelectedIndex(index);


      // Disable delete and download icons for other smile strings
      const checkboxes = document.querySelectorAll('[id^="smile_"]');
      checkboxes.forEach((cb, idx) => {
        const checkboxIndex = parseInt(cb.id.split('_')[1], 10);
        const deleteIcon = document.getElementById(`delete_icon_${checkboxIndex}`);
        const downloadIcon = document.getElementById(`download_icon_${checkboxIndex}`);

        if (checkboxIndex !== index) {
          // Disable delete and download icons
          deleteIcon.classList.add('disabled');
          downloadIcon.classList.add('disabled');
        } else {
          // Enable delete and download icons for the selected smile string
          deleteIcon.classList.remove('disabled');
          downloadIcon.classList.remove('disabled');
        }
      });
    } else {
      console.error(`Checkbox with ID 'smile_${index}' not found.`);
    }
  };

  //select all moleculelist
  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    const checkboxes = document.querySelectorAll('[id^="smile_"]');

    checkboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });

    // Update selected SMILES string state for all checkboxes
    const smilesList = extractedSmiles.split('\n');
    setSelectedSmile(isChecked ? smilesList.join('\n') : '');
  };

  useEffect(() => {   //to show the selected smile structure in the editor
    // Update the visual editor when the selected SMILES string changes
    if (window.ketcher && selectedSmile) {
      // Assuming setMolecule is a function to set the editor's structure.
      // Replace it with the correct method to initialize the molecule from a SMILES string.
      window.ketcher.setMolecule(selectedSmile)
        .catch(error => {
          console.error('Error setting molecule in Ketcher:', error);
          toast.error(`Error setting molecule: ${error}`);
        });
    }
  }, [selectedSmile]);



  // To delete the selected smile
  const handleDeleteSmile = (index) => {
    // Update extractedSmiles state by removing the SMILES string at the specified index
    const updatedSmiles = extractedSmiles.split('\n').filter((_, idx) => idx !== index).join('\n');
    setExtractedSmiles(updatedSmiles);
  };

  const handleDownloadSmile = (smile) => {
    // Create a blob with the SMILES string content
    const blob = new Blob([smile], { type: 'text/plain' });
    // Create a temporary anchor element to trigger the download
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'molecule_smile.txt'; // Set the filename for download
    // Programmatically click the anchor to trigger download
    anchor.click();
    // Clean up by revoking the object URL
    URL.revokeObjectURL(anchor.href);
  };


  const handleUploadClick = () => {   // Function to handle the "Upload file" option click
    setActiveTab('upload'); // Update activeTab state to 'upload'
    setShowFileInput(true); // Show file input
  };


  const handleExampleClick = async () => {
    const exampleSmile =
      ["CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5", "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5",
        // "C1CCC23CCC45CCCC64C25C13CC6", 
        "CC(C)(C)OC(=O)NC(Cc1ccccc1)C(=O)NCc1cccc(C(=O)NC2CC2)c1",
        "CN(C)CCNC(=O)c1ccc(Nc2ncnc3cc(C=CC(=O)NO)ccc23)cc1-c1ccc(F)cc1",
        "CCCC(=O)C(C)C(NC(=O)C(CC1CCCCC1)NC(=O)C(C)CC1CCCC1)C(C)C",
      ];
    const randomSmile = exampleSmile.sort(() => Math.random() - Math.random()).slice(0, 1)[0];
    setSmileString(randomSmile);
  };

  useEffect(() => {
    const smilesInputEle = document.getElementById('smiles-string-input');

    smilesInputEle.addEventListener('paste', function (e) {
      e.preventDefault();
      let contentOnBlur = (e.originalEvent || e).clipboardData.getData('text/plain');
      contentOnBlur = contentOnBlur.replaceAll(" ", '');
      smilesInputEle.value = contentOnBlur;
    })
  }, [])

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const smilesList = text.split('\n').map(row => row.split(',')[0]);
        const validSmilesList = smilesList.filter(smile => smile.trim() !== '' && /^[^J][A-Za-z0-9@+\-\[\]\(\)\\\/%=#$]+$/.test(smile.trim()));
        const extractedSmiles = validSmilesList.join('\n');

        // Update extractedSmiles state with the extracted SMILES directly
        setExtractedSmiles(extractedSmiles);
        toast.success(`${validSmilesList.length} SMILES extracted from the CSV file.`);
      };
      reader.readAsText(file);
    }
  };

// Inside the validateSmileString function:
const validateSmileString = (smileString) => {
  const regex = /^[A-Za-z0-9+\-()=#@\[\]]+$/;
  if (regex.test(smileString) && smileString.trim() !== "") {
    // Valid SMILES string
    // toast.success('Your SMILE String has been successfully validated. You can now view and edit in the Visual Editor.',{
    //   placement: 'top-center', // Customize toast position,
    //   style:{
    //     marginBottom:'460px'
    //   }
    // });
    toast.success('Your SMILES string has been successfully validated.');
    setShowPredictButton(true);
    setIsPredictDisabled(false);
    setActiveTab('visual'); // Set active tab to 'smile'
  } else {
    // Invalid SMILES string
    // toast.error('Please enter a valid SMILES string.');
    toast.error('Please enter a valid SMILES string.');
    setShowPredictButton(false); // Hide Predict button if the string is invalid or empty
  }
};

  const handlePredictClick = async () => {
    setIsPredictDisabled(true);

    if (!smileString.trim()) {
      toast.error('SMILE string is empty. Please enter a valid SMILE string.');
      return;
    }

    if (currentWflow === 'ADMET') {
      AdmtApiCall();
    } else {
      RetroApiCall();
    }

  };


  const AdmtApiCall = async () => {
    try {

      // Step 1: Send the SMILE string to the admet_predict endpoint
      const predictResponse = await fetch(apiUrl + '/api/v1/admet_predict/', {
        method: 'POST',
        headers: postapi_header,
        body: JSON.stringify({ smile: smileString }),
      });

      if (!predictResponse.ok) {
        const message = await predictResponse.text();
        throw new Error(`Prediction request failed: ${predictResponse.status} ${message}`);
      }

      // Assume the response is { "message": "Task added to queue", "length_queue": 1 }
      // const predictData = await predictResponse.json();
      // toast.info(predictData.message);
      setLoader(true)
      // setupdatedSmileString(smileString)
      // Step 2: Wait for 10 seconds before fetching the result
      setTimeout(getadmetresponse, 5000);

    } catch (error) {
      console.error('Error during the prediction process:', error);
      toast.error(`Error during prediction: ${error.message}`);
    }
  }
  const getadmetresponse = async () => {
    try {
      // debugger
      const responseResult = await fetch(apiUrl + '/api/v1/get_admet_result', {
        method: 'POST', // Use POST method as specified
        headers: postapi_header,
        // Assuming the endpoint requires the SMILE string
        body: JSON.stringify({ smile: smileString }),
      });
      if (!responseResult.ok) {
        throw new Error(`HTTP error! status: ${responseResult.status}`);
      }
      else {
        const resultData = await responseResult.json();// Define resultData here from the response
        console.log("result data", resultData)
        if (resultData.code == 200) {
          console.log(resultData.result)
          setPredictionResult(resultData.result);// Update the state with the fetched results
          // setupdatedSmileString(resultData.result)

          // const filteredResult = filterPredictionResult(resultData)
          setPredictionResult(resultData); // Assuming resultData is your API response
          setShowPopup(true);
          setLoader(false)
          setIsPredictDisabled(true);
             // Scroll to result section
             resultRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        else {
          console.log(getadmetresponse)
          setTimeout(getadmetresponse, 5000);
        }
      }
    } catch (error) {
      console.error('Error during fetching prediction results:', error);
      toast.error(`Error during fetching results: ${error.message}`);
    }

  }




  const RetroApiCall = async () => {
    try {
      // Step 1: Send the SMILE string to the retrosynth endpoint
      const predictResponse = await fetch(apiUrl + '/api/v1/synth/', {
        method: 'POST',
        headers: postapi_header,
        body: JSON.stringify({ smile: smileString }),
      });

      if (!predictResponse.ok) {
        const message = await predictResponse.text();
        throw new Error(`Prediction request failed: ${predictResponse.status} ${message}`);
      }

      // Assume the response is { "message": "Task added to queue", "length_queue": 1 }
      const predictData = await predictResponse.json();
      toast.info(predictData.message);
      setLoader(true)

      // Step 2: Wait for 10 seconds before fetching the result
      setTimeout(getretroResp, 10000);

    } catch (error) {
      console.error('Error during the prediction process:', error);
      toast.error(`Error during prediction: ${error.message}`);
    }
  }
  const getretroResp = async () => {

    try {
      const responseResult = await fetch(apiUrl + '/api/v1/get_synth_result', {
        method: 'POST', // Use POST method as specified
        headers: postapi_header,
        // Assuming the endpoint requires the SMILE string
        body: JSON.stringify({ smile: smileString }),
      });

      if (!responseResult.ok) {
        throw new Error(`HTTP error! status: ${responseResult.status}`);
      }
      else {
        const resultData = await responseResult.json();// Define resultData here from the response
        if (resultData.code == 200) {
          setPredictionResult(resultData.result);// Update the state with the fetched results

          // const filteredResult = filterPredictionResult(resultData)
          setPredictionResult(resultData); // Assuming resultData is your API response
          setShowPopup(true);
          setLoader(false)
          setIsPredictDisabled(true);
        }
        else {
          setTimeout(getretroResp, 5000);
        }

      }

    } catch (error) {
      console.error('Error during fetching prediction results:', error);
      toast.error(`Error during fetching results: ${error.message}`);
    }
  }
  // Additionally, hide the Predict button if the textarea becomes empty
  const handleInputChange = (e) => {
    setSmileString(e.target.value);
    console.log(smileString, e.target.value)
    // Hide predict button and results popup immediately when input changes
    setShowPredictButton(false);
    setShowPopup(false);
    setPredictionResult(null); // Clear previous prediction results

  };
  const setMolecule = async () => {
    if (window.ketcher && smileString) {
      try {
        // Assuming setMolecule is a function to set the editor's structure.
        // Replace with the correct method to initialize the molecule from a SMILES string if different.
        console.log(smileString)
        await window.ketcher.setMolecule(smileString);
      } catch (error) {
        console.error('Error setting molecule in Ketcher:', error);
        toast.error(`Error setting molecule: ${error}`);
      }
    }
  };
  const getMolecule = async () => {
    if (window.ketcher && smileString) {
      try {
        // Assuming setMolecule is a function to set the editor's structure.
        // Replace with the correct method to initialize the molecule from a SMILES string if different.
        let str = await window.ketcher.getSmiles(false);
        console.log(str)
        setSmileString(str);
      } catch (error) {
        console.error('Error setting molecule in Ketcher:', error);
        toast.error(`Error setting molecule: ${error}`);
      }
    }
  };
  useEffect(() => {
    // Calls setMolecule once component mounts and whenever smileString changes
    setMolecule();
  }, [smileString]);

  const handleactiveTab = (e) => {
    console.log(e)
    setActiveTab(e)
    if (e === 'smile') {
      getMolecule()
    }
  }

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, []);
  



  return (
    <>
    {/* <p><Link className=' hover:underline' to={`/`}>Home</Link> &gt; <Link className=' hover:underline' to={`/projects`}>  Projects</Link> &gt;  {projectDetails.project_name}</p> */}
    <ToastContainer />
      <div className="container page-dashboard mx-auto px-4 sm:px-8 max-w-screen-xl bg-[#F4F4F4]">

        <div className="header">
          <p><Link className=' hover:underline' to={`/`}>Home</Link> &gt; <Link className=' hover:underline' to={`/projects`}>  Projects</Link> &gt; <Link className=' hover:underline' to={`/projects/projectroutes/`}> </Link></p>
        </div>
        <div className="path-editors flex flex-wrap justify-start sm:justify-start">
          <p
            className={`${activeTab === 'smile' && 'text-[#000000] font-semibold border-b-2 border-[#746AAF]'}`}
            onClick={() => handleactiveTab('smile')}
            style={{cursor:"pointer"}}
          >
            Paste Smile
          </p>
          <p className="px-1">|</p>
          <p
            className={`${activeTab === 'visual' && 'text-[#000000] font-semibold border-b-2 border-[#746AAF]'}`}
            onClick={() => handleactiveTab('visual')}
            style={{cursor:"pointer"}}
          >
            Draw Structure
          </p>
          <p className="px-1">|</p>
          <p
            className={`${activeTab === 'upload' && 'text-[#000000] font-semibold border-b-2 border-[#746AAF]'}`}
            onClick={handleUploadClick}
            style={{cursor:"pointer"}}
          >
            Upload file
          </p>
        </div>
        <div
          className="get-an-example  mt-4 mb-2 text-[#4E8FAB] font-semibold text-sm text-right cursor-pointer"
          onClick={handleExampleClick}
        >
          Get an example
        </div>
        {/* <div className="flex flex-col sm:flex-row mt-3 w-full"> */}
        <div className="flex flex-col sm:flex-row items-start">
          <input
            type="text"
            id="smiles-string-input"
            className="w-[900px] h-[32px] rounded-[5px] px-3 py-[5px] font-bold border cursor-pointer"
            value={smileString}
            onPaste={handleInputChange}
            onChange={handleInputChange}
          />

          <div className="flex flex-wrap items-start sm:ml-4  sm:mt-0">
            <button
              className="validate rounded-[5px] text-white px-4 h-[32px] ml-20 w-[100px] mb-2 sm:mb-0"
              style={{ backgroundColor: smileString ? '#4E8FAB' : '', color: smileString ? 'white' : '' }}
              onClick={() => validateSmileString(smileString)}
              disabled={!smileString}
            >
              Validate
            </button>
            {/* <ToastContainer position="top-right" style={{ marginTop: '3px' }} autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover /> */}
            {/* {showPredictButton && activeTab === 'smile' && (
              <button
                className="predict rounded-[5px] text-white px-4 h-[32px] w-[100px] sm:ml-2"
                onClick={handlePredictClick}
                disabled={!showPredictButton || isPredictDisabled}
                style={{ backgroundColor: !showPredictButton || isPredictDisabled ? '#735AA7' : '' }}
              >
                Submit
              </button>
            )} */}
          </div>
        </div>

        {/* Display file input when activeTab is 'upload' and showFileInput is true */}
        {/* Display file input when activeTab is 'upload' and showFileInput is true */}
        {showFileInput && activeTab === '' && (
          <div className="flex items-center justify-center ml-48 mt-4 bg-opacity-50">
            <div className="bg-white p-8 rounded shadow-lg">
              <div className="flex flex-col items-center">
                <div className="mb-4">
                  <img src="https://cdn-icons-png.flaticon.com/128/3747/3747120.png" alt="upload-icon" width={40} height={40} />
                </div>
                <p className="text-gray-600 mb-2">Supporting Format (PDF/CSV/Text...)</p>
                <div
                  // onDrop={handleDrop}
                  // onDragOver={handleDragOver}
                  className="w-full h-32 border-dashed border-2 border-gray-400 flex items-center justify-center text-gray-600 mb-4"
                >

                  <div className="flex flex-col items-center">
                    <p>Drag file here</p>
                    <p className="mx-2">or</p>
                    <label className="text-blue-500 cursor-pointer">
                      Browse your file
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>

                </div>
                <button
                  // onClick={handleSubmit}
                  className="bg-blue-500 w-full text-white px-4 py-2 rounded"
                // disabled={!file}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'visual' && (
          <div className="mt-6">
            <div className="editor" style={{ width: '100%', maxWidth: '1013px', height: '454px' }}>
              <Editor
                staticResourcesUrl=""
                structServiceProvider={structServiceProvider}
                onInit={(ketcher) => {
                  window.ketcher = ketcher;
                  setMolecule();
                }}
              />
            </div>

            <button
            ref={resultRef}
onClick={handlePredictClick}
disabled={isPredictDisabled}
style={{ backgroundColor: !showPredictButton || isPredictDisabled ? '#735AA7' : '' }}
className="predict-button block mx-auto cursor-pointer"
>
Predict
</button>


            {/* <div className=" absolute right-12 mt-8 top-52 bg-white p-4 shadow-lg flex flex-col justify-between" style={{ width: '280px', height: '415px' }}> */}
              {/* <div> */}
              {/* </div> */}
              {/* Predict Button */}
              {/* <div className="w-[250px] relative mr-4" >
                <button
                  onClick={handlePredictClick}
                  disabled={isPredictDisabled}
                  style={{ backgroundColor: !showPredictButton || isPredictDisabled ? '#735AA7' : '' }}
                  className="w-[250px] text-white px-16 p-2 bg-[#735AA6]"
                >
                  Predict

                </button>
              </div> */}
            {/* </div> */}

         </div>
        )}


        {extractedSmiles && activeTab === 'visual' && (
          <div className=" w-2/6   shadow-md bg-[#E7EAEE]  ms-20 p-5" style={{ maxHeight: '490px', position: 'relative', bottom: '570px', left: '570px' }}>
            <div className="flex items-center justify-between mb-2">
              {/* Select All checkbox */}
              <input
                type="checkbox"
                id="select_all"
                className="mr-2"
                onChange={handleSelectAll} // Handle Select All action
              />
              <label htmlFor="select_all">Select All</label>
            </div>
            <h3 className="text-lg font-semibold mb-2">Molecule List</h3>
            <div className="overflow-y-auto max-h-80"> {/* Add scroll bar */}
              {/* Split the extractedSmiles into an array of SMILES strings */}
              {extractedSmiles.split('\n').map((smile, index) => (
                <div key={index} className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`smile_${index}`}
                      className="mr-2"
                      onChange={() => handleCheckboxChange(smile, index)} // Update selected SMILES string state
                    />
                    <label htmlFor={`smile_${index}`}>{smile}</label>
                  </div>
                  <div className="flex space-x-2">
                    {/* Delete icon */}
                    <RiDeleteBin5Line
                      id={`delete_icon_${index}`}
                      className={`text-red-500 cursor-pointer ${index !== previousSelectedIndex ? 'opacity-25 pointer-events-none' : ''}`}
                      onClick={() => handleDeleteSmile(index)}
                    />
                    {/* Download icon */}
                    <RiDownload2Line
                      id={`download_icon_${index}`}
                      className={`text-blue-500 cursor-pointer ${index !== previousSelectedIndex ? 'opacity-25 pointer-events-none' : ''}`}
                      onClick={() => handleDownloadSmile(smile)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button id="get_result_button" onClick={handlePredictClick} className="checked-result w-full button text-white bg-gray-400 rounded-lg  mt-10 px-24  p-2 ">Get Result</button>
          </div>

        )}

        {!loader ? (
          <>
            {currentWflow === 'ADMET' ? (
              showPopup && (
                <AdmetResultPage
                  predictionResult={predictionResult}
                  onClose={() => setShowPopup(false)}
                  smileString={smileString}
                />
              )
            ) : (
              showPopup && (
                <RetroResultPage
                  predictionResult={predictionResult}
                  onClose={() => setShowPopup(false)}
                  smileString={smileString}
                />
              )
            )}
          </>
        ) : (
          <div className="text-center pt-[10%]">
            <Loader />
          </div>
        )}
      </div>

    </>
  )
}

export default SmilePage1;