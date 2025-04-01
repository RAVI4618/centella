// import React, { useEffect, useRef } from 'react';
// import SmilesDrawer from "smiles-drawer";
// import "./../styles/editor.css"; // Make sure the CSS file is correctly imported
 
// const SmileViewer = ({ smileString, id, imgwidth = 300, imgheight = 150 }) => {
//     // Use ref to get canvas DOM node
//     const canvasRef = useRef(null);
 
//     useEffect(() => {
//         if (smileString) {
//             convertToStructuralImage(smileString);
//         }
//     }, [smileString, imgwidth, imgheight]);
 
//     const convertToStructuralImage = (smilesString) => {
//         console.log('Converting SMILES:', smilesString);
 
//         const options = {
//             width: imgwidth,
//             height: imgheight,
//         };
 
//         const smilesDrawer = new SmilesDrawer.Drawer(options);
 
//         const canvas = canvasRef.current;
//         if (canvas) {
//             const context = canvas.getContext("2d");
//             if (context) {
//                 context.clearRect(0, 0, canvas.width, canvas.height);
//             }
 
//             // Parse and draw the SMILES string
//             SmilesDrawer.parse(smilesString, function(tree) {
//                 console.log('Parsed tree:', tree);
//                 smilesDrawer.draw(tree, canvas, "light", false);
//             }, function(error) {
//                 console.error(`Error parsing SMILES string "${smilesString}":`, error);
//             });
//         } else {
//             console.error('Canvas ref not found.');
//         }
//     };
 
//     return (
//         <span className='p-2 border rounded' style={{ width: imgwidth + 'px', height: imgheight + 'px' }}>
//             <canvas ref={canvasRef} width={imgwidth} height={imgheight}></canvas>
//         </span>
//     );
// };
 
// export default SmileViewer;
 
import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { base_api_url, post_api_headers, post_api_file_headers, default_api_headers } from "../utils/Store";
 
 
const SmileViewer = ({ smileString, imgwidth = 250, imgheight = 250 }) => {
    const baseurl = useAtom(base_api_url)[0]
    const defaultheaders = useAtom(default_api_headers)[0]
    const postapi_header = useAtom(post_api_headers)[0];
    const [imageUrl, setImageUrl] = useState(null);
 
    useEffect(() => {
        if (smileString) {
            convertSmilesToImage(smileString);
        }
    }, [smileString]);
 
    const convertSmilesToImage = async (smileString) => {
        try {
            const response = await fetch( baseurl+'retro-uat/get-image', {
                method: 'POST',
                headers: {
                    ...postapi_header
                },
                body: JSON.stringify({ smile: smileString }),
            });
 
            if (response.ok) {
                const blob = await response.blob();
                const imageObjectUrl = URL.createObjectURL(blob);
                setImageUrl(imageObjectUrl);
            } else {
                console.error('Error fetching the image:', response.statusText);
            }
        } catch (error) {
            console.error('Error converting SMILES to image:', error);
        }
    };
 
    return (
        <span className='p-2  rounded' style={{ width: imgwidth + 'px', height: imgheight + 'px' }}>
            {imageUrl ? (
                <img src={imageUrl} alt="SMILES Structure" style={{ width: imgwidth, height: imgheight }} />
            ) : (
                <p>Loading...</p>
            )}
        </span>
    );
};
 
export default SmileViewer;
 
 
 
 