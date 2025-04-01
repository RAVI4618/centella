import React from 'react'
import { useState } from 'react';
import { toast } from 'sonner';
import { loginRequest } from '../authConfig';
import logo from './../images/cenlogotransparent.png'
import banner from './../images/banner.png'
import { useMsal } from '@azure/msal-react';

function Login() {
    const { instance } = useMsal();
    
    const handleLoginRedirect = () => {
        instance.loginRedirect(loginRequest).catch((error) => console.log(error));
    };




    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { ...allData } = { email, password };
    const canSubmit = [...Object.values(allData)].every(Boolean);
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = null
            //   const res = await signIn("credentials", {
            //     email,
            //     password,
            //     redirect: false,
            //   });
            console.log(res)
            if (res.error) {
                toast.error("Invalid Credentials!!")
                return;
            }
            toast.success("Logged in Succeffully!!")

            //router.replace("dashboard");
        } catch (error) {
            console.log(error);
        }
    };
  return (
    <>
                            <div className="h-screen border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="flex flex-wrap items-center">
                            <div className="bg-zinc-100 xl:block w-1/2">
                                <nav className=" flex-between w-full mb-16 pl-4 pt-3">
                                    <a href="/" className=" flex gap-2 flex-centre">
                                        <img
                                            src={logo}
                                            alt="Centella Logo"
                                            width={42}
                                            height={42}
                                            className="object-contain"

                                        />
                                        <p className="logo_text pt-1 text-[#89AF3E] text-[19px] font-bold">CENTELLA</p>
                                    </a>
                                </nav>


                                <div className="py-17.5 px-26 text-center pt-6">


                                    <p className="2xl:px-20 text-2xl">
                                            Accelerating drug discovery through human and machine intelligence
                                    </p>

                                    <span className="mt-15 inline-block pt-4 pb-8">
                                        <img
                                            src={banner}
                                            alt="Centella Logo"
                                            width={600}
                                            height={550}
                                            className="object-contain"

                                        />
                                    </span>
                                </div>
                            </div>

                            <div className="border-stroke dark:border-strokedark w-1/2">
                                <div className="w-full p-8 sm:p-12.5 xl:p-17.5">

                                    <div className="text-3xl font-bold text-black dark:text-white sm:text-title-xl2 pt-4">
                                        Welcome to <span className='text-lime-600'>Centella</span>
                                    </div>
                                    <span className="mb-1.5 block font-medium pb-4">Login to your account</span>
                                    <form action="" onSubmit={handleSubmit} className='pr-40 group'>
                                        <div className="mb-8">
                                            <label className="mb-2.5 block font-medium text-black dark:text-white">
                                                Email
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white placeholder-gray-300 valid:[&:not(:placeholder-shown)]:border-green-500 [&:not(:placeholder-shown):not(:focus):invalid~span]:block invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-400"
                                                    autoComplete="true"
                                                    pattern="[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    name="email" id="email"
                                                // onChange={(e) => { setData({ ...data, email: e.target.value, }); }}
                                                />
                                                <span className="mt-1 hidden text-sm text-red-400">
                                                    Please enter a valid email address.{' '}
                                                </span>
                                                <span className="absolute right-4 top-3">
                                                    <svg
                                                        className="fill-current"
                                                        width="22"
                                                        height="22"
                                                        viewBox="0 0 22 22"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <g opacity="0.5">
                                                            <path
                                                                d="M19.2516 3.30005H2.75156C1.58281 3.30005 0.585938 4.26255 0.585938 5.46567V16.6032C0.585938 17.7719 1.54844 18.7688 2.75156 18.7688H19.2516C20.4203 18.7688 21.4172 17.8063 21.4172 16.6032V5.4313C21.4172 4.26255 20.4203 3.30005 19.2516 3.30005ZM19.2516 4.84692C19.2859 4.84692 19.3203 4.84692 19.3547 4.84692L11.0016 10.2094L2.64844 4.84692C2.68281 4.84692 2.71719 4.84692 2.75156 4.84692H19.2516ZM19.2516 17.1532H2.75156C2.40781 17.1532 2.13281 16.8782 2.13281 16.5344V6.35942L10.1766 11.5157C10.4172 11.6875 10.6922 11.7563 10.9672 11.7563C11.2422 11.7563 11.5172 11.6875 11.7578 11.5157L19.8016 6.35942V16.5688C19.8703 16.9125 19.5953 17.1532 19.2516 17.1532Z"
                                                                fill=""
                                                            />
                                                        </g>
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    

                                        <div className="mb-8">
                                            <label className="mb-2.5 block font-medium text-black dark:text-white">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    placeholder="6+ Characters, 1 Capital letter"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white focus:outline-none placeholder-gray-300 valid:[&:not(:placeholder-shown)]:border-green-500 [&:not(:placeholder-shown):not(:focus):invalid~span]:block invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-400"
                                                    pattern=".{7,}"
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    // onChange={(e) => { setData({ ...data, password: e.target.value, }); }}
                                                    required
                                                    name="password" id="password"
                                                />
                                                <span className="mt-1 hidden text-sm text-red-400">
                                                    Password must be at least 8 characters.{' '}
                                                </span>
                                                <span className="absolute right-4 top-3">
                                                    <svg
                                                        className="fill-current"
                                                        width="22"
                                                        height="22"
                                                        viewBox="0 0 22 22"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <g opacity="0.5">
                                                            <path
                                                                d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626ZM8.55781 3.09376C9.31406 2.40626 10.3109 2.06251 11.3422 2.16563C13.1641 2.33751 14.6078 3.98751 14.6078 5.91251V6.70313H7.38906V5.67188C7.38906 4.70938 7.80156 3.78126 8.55781 3.09376ZM18.1141 17.2906C18.1141 18.7 16.9453 19.8688 15.5359 19.8688H6.46094C5.05156 19.8688 3.91719 18.7344 3.91719 17.325V11.0688C3.91719 9.52189 5.15469 8.28438 6.70156 8.28438H15.2953C16.8422 8.28438 18.1141 9.52188 18.1141 11V17.2906Z"
                                                                fill=""
                                                            />
                                                            <path
                                                                d="M10.9977 11.8594C10.5852 11.8594 10.207 12.2031 10.207 12.65V16.2594C10.207 16.6719 10.5508 17.05 10.9977 17.05C11.4102 17.05 11.7883 16.7063 11.7883 16.2594V12.6156C11.7883 12.2031 11.4102 11.8594 10.9977 11.8594Z"
                                                                fill=""
                                                            />
                                                        </g>
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-5">
                                            <button
                                                type="submit"
                                                disabled={!canSubmit}

                                                className="w-full text-white bg-purple-800 bg-opacity-80 hover:bg-purple-900 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-3 text-center mb-8 mt-2 disabled:bg-gradient-to-br disabled:from-gray-100 disabled:to-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed group-invalid:bg-gradient-to-br group-invalid:from-gray-100 group-invalid:to-gray-300 group-invalid:text-gray-400 group-invalid:pointer-events-none group-invalid:opacity-70"
                                            >Sign In</button>
                                        </div>

                                    </form>

                                    <button className=' bg-indigo-500 text-white p-2 rounded-md' onClick={handleLoginRedirect}>Azure B2c</button>
                                </div>
                            </div>
                        </div>
                    </div>
    </>
  )
}

export default Login