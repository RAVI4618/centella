import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { base_api_url, post_api_headers } from "../utils/Store";
 
const SmileToName = ({ smileString }) => {
    const baseurl = useAtom(base_api_url)[0];
    const postapi_header = useAtom(post_api_headers)[0];
    const [chemicalName, setChemicalName] = useState('');
 
    useEffect(() => {
        if (smileString) {
            fetchChemicalName(smileString);
        }
    }, [smileString]);
 
    const fetchChemicalName = async (smileString) => {
        try {
            const response = await fetch(baseurl + 'retro-uat/synonym', {
                method: 'POST',
                headers: {
                    ...postapi_header,
                },
                body: JSON.stringify({ smile: smileString }),
            });
 
            if (response.ok) {
                const name = await response.text();  // Parse as text instead of JSON
                setChemicalName(name);
            } else {
                console.error('Error fetching the chemical name:', response.statusText);
            }
        } catch (error) {
            console.error('Error converting SMILES to name:', error);
        }
    };
 
    return (
<span
  className="p-2 rounded"
  title={chemicalName || smileString} 
>
  {chemicalName ? (
    <p>
      {chemicalName.length > 15 ? `${chemicalName.slice(0, 15)}...` : chemicalName}
    </p>
  ) : (
    <p>
      {smileString.length > 15 ? `${smileString.slice(0, 15)}...` : smileString}
    </p>
  )}
</span>

    );
};
 
export default SmileToName;
 
 