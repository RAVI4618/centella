import { atom } from 'jotai';

export const currentWorkflow = atom("ADMET"); 
export const base_api_url=atom("https://caitapimus.azure-api.net/")
const subKey='e3ad0fb3039a48ba840ce271ef718c82'
export const post_api_headers=atom({ 'Ocp-Apim-Subscription-Key':subKey ,'Content-Type':'application/json'})
export const default_api_headers=atom({ 'Ocp-Apim-Subscription-Key':subKey })
export const loggeduser=atom({ 'id':'87' ,'username':'Cent User1','email':'centaiu001@yopmail.com','eid':'8a83de36-8881-400d-8851-384b30b010c2'})
export const post_api_file_headers =atom({'Content-type':'multipart/form data'})