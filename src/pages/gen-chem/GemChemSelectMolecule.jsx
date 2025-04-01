import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useMsal } from '@azure/msal-react';
import { toast } from 'sonner';
import { base_api_url, post_api_headers } from '../../utils/Store';
import { useAtom } from 'jotai';

const SelectMolecule = () => {
    const location = useLocation();
    const { validSmiles } = location.state || {};
    const [moleculeInput, setMoleculeInput] = useState('');
    const [generateType, setGenerateType] = useState('random');
    const [taskId, setTaskId] = useState(null);
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const username = activeAccount?.name;
    const baseurl = useAtom(base_api_url)[0];
    const postapi_header = useAtom(post_api_headers)[0];

    // Taking the project ID from the path (URL)
    const path = location.pathname.split('/');
    const projectId = path[path.length - 1];

    const handleGenerateMolecule = () => {
        if (!moleculeInput || !validSmiles) {
            console.error('Molecule number and file are required.');
            toast.error('Molecule number and file are required.');
            return;
        }

        const numberInput = parseInt(moleculeInput, 10);
        if (isNaN(numberInput) || numberInput <= 0 || numberInput > 30000) {
            toast.error('Please enter a valid number between 1 and 30,000.');
            return;
        }

        const smilesText = `SMILES Data: ${validSmiles}`;
        const file = new File([smilesText], 'smiles_data.txt', { type: 'text/plain' });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('targetno', moleculeInput);
        formData.append('gtype', 'generate');
        formData.append('generateType', generateType);

        const apiUrl = `${baseurl}/genchem/api/v1/upload?targetno=${moleculeInput}&gtype=generate&userId=12&userName=${username}&projectId=${projectId}`;

        axios.post(apiUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82',
            }
        })
        .then(response => {
            const generatedTaskId = response.data.task_id; 
            console.log('API Response:', response.data);
            setTaskId(generatedTaskId);
            toast.success(`Task ID is created. It will generate the molecules.`, {
                className: 'mt-16'
            });
        })
        .catch(error => {
            if (error.response) {
                console.error('Server responded with:', error.response.data);
                console.error('Status code:', error.response.status);
                toast.error(`Error: ${error.response.data}`, {
                    className: 'mt-16'
                });
            } else if (error.request) {
                console.error('Request made but no response received:', error.request);
                toast.error('Request made but no response received', {
                    className: 'mt-16'
                });
            } else {
                console.error('Error setting up request:', error.message);
                toast.error(`Error: ${error.message}`, {
                    className: 'mt-16'
                });
            }
        });
    };

    return (
        <div className='pl-10 mr-12 w-full my-20'>
            <div className='my-5 text-slate-500 text-sm'>
                <label>Select number of molecules</label>
            </div>
            <div className='flex'>
                <div className='w-[276px] h-[40px]'>
                    <input
                        type='number'
                        placeholder='Input text (min 1 - max 30k)'
                        value={moleculeInput}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value) && parseInt(value, 10) <= 30000) {
                                setMoleculeInput(value);
                            }
                        }}
                        className='pl-5 text-sm py-4 w-full border shadow-lg rounded-md'
                    />
                </div>
                <div className='ml-3'>
                    <select
                        value={generateType}
                        onChange={(e) => setGenerateType(e.target.value)}
                        className='pl-5 text-sm py-4 border w-full shadow-lg rounded-md'
                    >
                        <option value='random w-full'>Random</option>
                        <option value='finetune w-full'>Finetune</option>
                    </select>
                </div>
                <div className='w-[15%] mr-12'>
                    <button
                        onClick={handleGenerateMolecule}
                        className='flex w-full justify-center rounded-md items-center px-6 py-[14px] ml-3 bg-[#735AA8] text-white shadow-lg hover:dark:bg-slate-800 focus:outline-none'
                    >
                        <span className='font-medium'>Generate</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectMolecule;
