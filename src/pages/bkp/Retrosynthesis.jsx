import React, { useEffect, useState } from "react";
import './../../styles/editor.css'
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAtom } from 'jotai';
import projData from '../../json/projects.json'
import { base_api_url, currentWorkflow, post_api_headers } from "../../utils/Store";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from "../../components/Loader";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import { Editor } from "ketcher-react";
import "ketcher-react/dist/index.css";
import RetroResultPage from "../../components/retro/RetroResultPage";
import RetroSingleTypeResults from "../../components/retro/RetroSingleTypeResults";
import Switch from 'react-switch';

const structServiceProvider = new StandaloneStructServiceProvider();


const Retrosynthesis = () => {
    const location = useLocation();
    const { state } = location;
    const navigate = useNavigate();
    const oid = location.pathname.split('/')[3];
    const projectDetails = projData.filter((e) => e.id === oid)[0];
    const [currentWflow] = useAtom(currentWorkflow);
    const [smileString, setSmileString] = useState(''); //current smile string
    const [predictionResult, setPredictionResult] = useState(null); //the result of the prediction API call
    const [showPredictButton, setShowPredictButton] = useState(false); //controls the visibility of the predict button
    const [showPopup, setShowPopup] = useState(false); //controls the visibility of the result popup
    const [activeTab, setActiveTab] = useState('smile'); //tracks which tab is active (smile,visual,upload)
    const [isPredictDisabled, setIsPredictDisabled] = useState(false); //disables the predict button when necessary
    const [loader, setLoader] = useState(false); //Controls the visibility of the loader during API calls.
    const apiUrl = useAtom(base_api_url)[0];
    const postapi_header = useAtom(post_api_headers)[0];
    const [showResults, setShowResults] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showResultPage, setShowResultPage] = useState(false); // State to toggle showing result page
   
    const [selectedModel, setSelectedModel] = useState('multi-step'); // State for selected model
    const [isMultiStep, setIsMultiStep] = useState(true); // State for toggle switch
    const [selectedOption, setSelectedOption] = useState('automatic');

    const handleToggleChange = (checked) => {
        setIsMultiStep(checked);
        if (checked) {
            setSelectedModel('multi-step');
        } else {
            setSelectedModel('single-step');
        }
    };

    const getDescription = () => {
        if (selectedModel === 'multi-step') {
            return 'Predict the routes using multi-step model';
        } else if (selectedModel === 'single-step') {
            return 'Predict the routes using single-step model';
        }
    };

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleExampleClick = async () => {
        const exampleSmile =
            ["CC(C)(C)OC(=O)NC(Cc1ccccc1)C(=O)NCc1cccc(C(=O)NC2CC2)c1",
               
                "CC(C)(C)OC(=O)NC(Cc1ccccc1)C(=O)NCc1cccc(C(=O)NC2CC2)c1",
                "CN(C)CCNC(=O)c1ccc(Nc2ncnc3cc(C=CC(=O)NO)ccc23)cc1-c1ccc(F)cc1",
                "CCCC(=O)C(C)C(NC(=O)C(CC1CCCCC1)NC(=O)C(C)CC1CCCC1)C(C)C",
            ];
        const randomSmile = exampleSmile.sort(() => Math.random() - Math.random()).slice(0, 1)[0];
        setSmileString(randomSmile);
        
        // toast.info('Example SMILE string is set.');
        // setTimeout(() => {
        //     if (window.ketcher) {
        //         window.ketcher.setMolecule(randomSmile);
        //     }
        // }, 500);
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

    const validateSmileString = async () => {
      setIsPredictDisabled(true); // Disable predict button during validation

  
      try {
          const response = await fetch('https://caitapimus.azure-api.net/retrot5/smile_validation', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ sequence: smileString })
          });
  
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const responseData = await response.json();
  
          if (responseData === "Not valid") {
              toast.error('Please enter a valid SMILES string.');
              setShowPredictButton(false); // Hide Predict button if the string is invalid
          } else {
              toast.success('Your SMILES string has been successfully validated.');
              setActiveTab('visual')
              setShowPredictButton(true); // Show Predict button if the string is valid
             
          }
  
          setIsPredictDisabled(false); // Enable predict button after validation
      } catch (error) {
          console.error('Error validating SMILES string:', error);
          toast.error(`Error validating SMILES string: ${error.message}`);
          setIsPredictDisabled(false); // Ensure predict button is enabled in case of error
      }
  };
  

  const handlePredictClick = async () => {
    setIsPredictDisabled(true);

    // Scroll to loader
    const loaderElement = document.getElementById('loader');
    if (loaderElement) {
        loaderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (!smileString.trim()) {
        toast.error('SMILE string is empty. Please enter a valid SMILE string.');
        setIsPredictDisabled(false);
        return;
    }

    if (activeTab === 'visual') {
        await getMolecule();
    }

    if (selectedModel === 'multi-step') {
        RetroApiCall();
    } else if (selectedModel === 'single-step') {
        try {
            setLoader(true);
            const response = await fetch('https://caitapimus.azure-api.net/retrot5/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // ...postapi_header,
                },
                body: JSON.stringify({ sequence: smileString }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const resultData = await response.json();
            setPredictionResult(resultData);
            setShowPopup(true);
        } catch (error) {
            console.error('Error fetching single-step prediction results:', error);
            toast.error(`Error fetching single-step results: ${error.message}`);
        } finally {
            setLoader(false);
            setIsPredictDisabled(false); // Enable predict button regardless of success or failure
        }
    }
};



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
            // toast.info(predictData.message);
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
        setShowPredictButton(false); // Hide predict button and results popup immediately when input changes
        setShowPopup(false);
        setPredictionResult(null); // Clear previous prediction results
      };
      const setMolecule = async () => {
        if (window.ketcher && smileString) {
          try {
            await window.ketcher.setMolecule(smileString);
          } catch (error) {
            console.error("Error setting molecule in Ketcher:", error);
            // toast.error(`Error setting molecule: ${error.message}`);
          }
        }
      };
      const getMolecule = async () => {
        if (window.ketcher) {
          try {
            const newSmile = await window.ketcher.getMolecule();
            if (newSmile !== smileString) {
              setSmileString(newSmile);
              validateSmileString();
            }
          } catch (error) {
            console.error("Error getting molecule from Ketcher:", error);
            // toast.error(`Error getting molecule: ${error.message}`);
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



    return (
        <>
        <ToastContainer />
        <div>
        </div>
        <div>
        <p className="mb-4"><Link className=' hover:underline' to={`/`}>Home</Link> &gt; <Link className=' hover:underline' to={`/RetroProjects`}>  Projects</Link> &gt; </p>
        </div>
            <div className="container page-dashboard mx-auto px-4 sm:px-8 max-w-screen-xl bg-[#F4F4F4]">
                <div className="path-editors flex flex-wrap justify-start sm:justify-start">
                    <p
                        className={`${activeTab === 'smile' && 'text-[#000000] font-semibold border-b-2 border-[#746AAF] ' }` }
                        onClick={() => handleactiveTab('smile')}
                        style={{cursor:"pointer"}}
                    >
                        Paste Smile
                    </p>
                    <p className="px-1">|</p>
                    <p
                        className={`${activeTab === 'visual' && 'text-[#000000]  font-semibold border-b-2 border-[#746AAF]'}`}
                        onClick={() => handleactiveTab('visual')}
                        style={{cursor:"pointer"}}
                    >
                        Draw structure
                    </p>
                    <p className="px-1">|</p>
                    <p
                        className={`${activeTab === 'upload' && 'text-[#000000] cursor-pointer font-semibold border-b-2 border-[#746AAF]'}`}
                        onClick={() => handleactiveTab('upload')}
                        style={{cursor:"pointer"}}
                    >
                        Upload file
                    </p>
                </div>
                <div
                    className="exampleR   text-[#4E8FAB] mb-1 font-semibold text-right cursor-pointer w-64"
                    onClick={handleExampleClick}
                >
                    Get an example
                </div>
                <div className="flex flex-col sm:flex-row items-start">
                    <input
                        type="text"
                        id="smiles-string-input"
                        className="w-[900px] h-[32px] rounded-[5px] font-bold px-3 py-[5px] border cursor-pointer"
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
                        {showPredictButton && activeTab === 'smile' && (
                            <button
                                className="predict rounded-[5px] text-white px-4 h-[32px] w-[100px] sm:ml-2"
                                onClick={handlePredictClick}
                                disabled={!showPredictButton || isPredictDisabled}
                                style={{ backgroundColor: !showPredictButton || isPredictDisabled ? '#735AA7' : '' }}
                            >
                                Submit
                            </button>
                        )}
                    </div>
                </div>

                {activeTab === 'visual' && (
                    <div className="mt-6">
                        <div className="editor" style={{ width: '100%', maxWidth: '1200px', height: '444px' }}>
                            <Editor
                                staticResourcesUrl=""
                                structServiceProvider={structServiceProvider}
                                onInit={(ketcher) => {
                                    window.ketcher = ketcher;
                                    setMolecule();
                                }}
                            />

                            <div className="absolute right-0 top-12 bg-white p-4 shadow-lg flex flex-col justify-between" style={{ width: '280px', height: '390px' }}>
                                <div>
                                    <h1 className="text-lg font-semibold mb-2"> Select no of steps</h1>
                                    <div className="mb-4 mt-4">
                <label className="flex items-center">
                    <span className="mr-2">Single-Step</span>
                    <Switch
                        onChange={handleToggleChange}
                        checked={isMultiStep}
                        onColor="#00B719"
                        offColor="#00B719"
                        onHandleColor="#fff"
                        offHandleColor="#fff"
                        uncheckedIcon={false}
                        checkedIcon={false}
                    />
                    <span className="ml-2">Multi-Step</span>
                </label>
            </div>

                                    <p className="text-md font-semibold mb-2 mt-3">Select AI Model</p>
                                    <div className="flex items-center ">
                    <label className="mr-4">
                        <input
                             type="radio"
                             value="automatic"
                             checked={selectedOption === 'automatic'}
                             onChange={handleOptionChange}
                             className="form-radio h-3.5 w-3.5 text-[#89AF3E] focus:ring-[#89AF3E]"
                        />
                        Automatic
                    </label>
                    <label>
                        <input
                             type="radio"
                             value="custom"
                             checked={selectedOption === 'custom'}
                             onChange={handleOptionChange}
                             className="form-radio h-3.5 w-3.5 text-[#89AF3E] focus:ring-[#89AF3E]"
                        />
                        Custom
                    </label>
                </div>
                                    <div className="mb-4">
                                    <div className="mb-4 mt-4 ">
                                    <select className="w-[158px] h-[30px] border-[0.4px] border-gray-500 rounded-[5px] opacity-100">
                                        <option>Template</option>
                                        <option>Text</option>
                                    </select>
                                    </div>

                                        <h2 className="text-sm font-semibold">Model Description</h2>
                                        <p className="mt-4">{getDescription()}</p>
                                    </div>
                                </div>
                                {/* Predict Button */}
                                <div className="w-[250px] relative mr-4">
                                    <button
                                        onClick={handlePredictClick}
                                        disabled={isPredictDisabled}
                                        style={{ backgroundColor: !showPredictButton || isPredictDisabled ? '#735AA7' : '' }}
                                        className="w-[250px] text-white px-16 p-2 bg-purple-400"
                                    >
                                        Predict Retrosynthestic Route

                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!loader ? (
                    <>
                        {(
                            showPopup && selectedModel === 'single-step' ? (
                                <RetroSingleTypeResults
                                    predictionResult={predictionResult}
                                    onClose={() => setShowPopup(false)}
                                    smileString={smileString}
                                />
                            ) : (
                                showPopup && (
                                    <RetroResultPage
                                        predictionResult={predictionResult}
                                        onClose={() => setShowPopup(false)}
                                        smileString={smileString}
                                    />
                                )
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

export default Retrosynthesis


