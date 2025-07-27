import React, { useState, useEffect } from 'react';
import WeatherBackground from './Component/Weatherbackground';

// 🛠️ Fix these imports with actual paths to your icons
import {HumidityIcon, WindIcon ,VisibilityIcon,SunriseIcon, SunsetIcon} from './Component/Icons.jsx';




const App = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('');
  const [suggestion, setSuggestion] = useState([]);
  const [unit, setUnit] = useState('C');
  const [error, setError] = useState('');
  const API_key = 'c21f60f511bcd7520be924d973015f0c';

  useEffect(() => {
    if (city.trim().length >= 3 && !weather) {
      const timer = setTimeout(() => fetchSuggestions(city), 500);
      return () => clearTimeout(timer);
    }
    setSuggestion([]);
  }, [city, weather]);

  const fetchSuggestions = async (query) => {
    try {
      const res = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_key}`
      );
      res.ok ? setSuggestion(await res.json()) : setSuggestion([]);
    } catch {
      setSuggestion([]);
    }
  };

  const fetchWeatherData = async (url, name = '') => {
    setError('');
    setWeather(null);
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error((await response.json()).message || 'City not Found');
      const data = await response.json();
      setWeather(data);
      setCity(name || data.name);
      setSuggestion([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return setError('Please enter valid city name');
    await fetchWeatherData(
      `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&appid=${API_key}&units=metric`
    );
  };

  const convertTemperature = (temp, unit) =>
    unit === 'C' ? temp.toFixed(1) : ((temp * 9) / 5 + 32).toFixed(1);

  const getHumidityValue = (humidity) => {
    if (humidity < 30) return 'Dry';
    if (humidity > 70) return 'Humid';
    return 'Comfortable';
  };

  const getVisibilityValue = (visibility) => {
    if (visibility >= 10000) return 'Clear';
    if (visibility >= 4000) return 'Moderate';
    return 'Low';
  };

  const getWeatherCondition = () =>
    weather && {
      main: weather.weather[0].main,
      isDay:
        Date.now() / 1000 > weather.sys.sunrise &&
        Date.now() / 1000 < weather.sys.sunset,
    };

  return (
    <div className="min-h-screen">
      <WeatherBackground condition={getWeatherCondition()} />
      <div className="flex items-center justify-center p-6 min-h-screen">
        <div className="bg-transparent backdrop-filter backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-md text-white w-full border border-white/30 relative z-10">
          <h1 className="text-4xl font-extrabold text-center mb-6">Weather App</h1>

          {!weather ? (
            <form onSubmit={handleSearch} className="flex flex-col relative">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter City or Country(min 3 letters)"
                className="mb-4 p-3 rounded border border-white bg-transparent text-white placeholder-white focus:outline-none focus:border-blue-300 transition duration-300"
              />
              {suggestion.length > 0 && (
                <div className="absolute top-12 left-0 right-0 bg-transparent shadow-md rounded z-10">
                  {suggestion.map((s) => (
                    <button
                      type="button"
                      key={`${s.lat}-${s.lon}`}
                      onClick={() =>
                        fetchWeatherData(
                          `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid=${API_key}&units=metric`,
                          `${s.name}, ${s.country}${s.state ? `, ${s.state}` : ''}`
                        )
                      }
                      className="block hover:bg-blue-700 bg-transparent px-4 py-2 text-sm text-left w-full transition-colors"
                    >
                      {s.name}, {s.country}
                      {s.state && `, ${s.state}`}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="submit"
                className="bg-purple-700 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Get Weather
              </button>
              {error && <p className="mt-2 text-red-400">{error}</p>}
            </form>
          ) : (
            <div className="mt-6 text-center transition-opacity duration-500">
              <button
                onClick={() => {
                  setWeather(null);
                  setCity('');
                }}
                className="mb-4 bg-purple-900 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded transition-colors"
              >
                New Search
              </button>

              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">{city}</h2>
                <button
                  onClick={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1 px-3 rounded transition-colors"
                >
                  &deg;{unit}
                </button>
              </div>

              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className="mx-auto my-4 animate-bounce"
              />
              <p className="text-4xl">
                {convertTemperature(weather.main.temp, unit)} &deg;{unit}
              </p>
              <p className="capitalize">{weather.weather[0].description}</p>

              <div className="flex flex-wrap justify-around mt-6">
                {[
                  [HumidityIcon, 'Humidity', `${weather.main.humidity}% (${getHumidityValue(weather.main.humidity)})`],
                  [WindIcon, 'Wind', `${weather.wind.speed} m/s`],
                  [VisibilityIcon, 'Visibility', getVisibilityValue(weather.visibility)],
                ].map(([Icon, label, value]) => (
                  <div key={label} className="flex flex-col items-center m-2">
                    <Icon size={32} />
                    <p className="mt-1 font-semibold">{label}</p>
                    <p className="text-sm">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-around mt-6">
                {[
                  [SunriseIcon, 'Sunrise', weather.sys.sunrise],
                  [SunsetIcon, 'Sunset', weather.sys.sunset],
                ].map(([Icon, label, time]) => (
                  <div key={label} className="flex flex-col items-center m-2">
                    <Icon size={32} />
                    <p className="mt-1 font-semibold">{label}</p>
                    <p className="text-sm">
                      {new Date(time * 1000).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-sm">
                <p>
                  <strong>Feels Like:</strong>{' '}
                  {convertTemperature(weather.main.feels_like, unit)} &deg;{unit}
                </p>
                <p>
                  <strong>Pressure:</strong> {weather.main.pressure} hPa
                </p>
              </div>
            </div>
          )}
          {error && <p className="text-red-400 text-center mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default App;








// // import React from 'react'
// // import WeatherBackground from './Component/Weatherbackground'
// // const App = () => {
// //   const [weather, setWeather] =useState(null);
// //   const getWeatherCondition =()=> weather && ({
// //     main: weathe.weather[0].main,
// //     isDay: Date.now() /1000 > weather.sys. sunrise && Date.now() /1000< weather.sys.sunset
// //   })
// //   return (

// //       <div className="min-h-screen">
// //         <WeatherBackground condition= {getWeatherCondition()} />
// //     <div className='flex items-center justify-center p-6 min-h-screen'>
// //       <div className='bg-transparent backdrop-filter backdrop-blur-md rounded-x1 shadow-2x1 p-8 max-w-md text-white w-full border border-white/30 relative z-10'>
// //       <h1 className='text-4x1 font-extrabold text-center mb-6'>
// //         Weather App
// //       </h1>
// //         </div> 
// //         </div>

// //     </div>
// //   )
// // }

// // export default App
// import React, { useState } from 'react';
// import WeatherBackground from './Component/Weatherbackground';

// const App = () => {
//   const [weather, setWeather] = useState(null);
//   const [City, setCity] = useState('');
//   const[suggestion, setSuggestion] = useState([]);
//   const[unit,setUnit]= useState('C');
//   const[error,setError]= useState('')
//   const API_key='c21f60f511bcd7520be924d973015f0c'

//   //https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon={s.lon}&appid={API_key}&units=metric

//   //https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
// //http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid={API key}
// //http://api.openweathermap.org/geo/1.0/direct?q={query}&limit=5&appid={API_key}
//   useEffect(()=>{
//     if(city.trim().length>=3 && !weather){
//       const timer= setTimeout(()=> fetchSuggestions(city),500);
//       return()=> clearTimeout(timer);
//     }
//     setSuggestion([]);
//   },[city, weather]);
//   const fetchSuggestions =async(query)=>{
//     try{
//       const res = await fetch(
//         `http://api.openweathermap.org/geo/1.0/direct?q={query}&limit=5&appid={API_key}`

//       );
//       res.ok ? setSuggestion(await res.json()): setSuggestion([]);
//     }
//     catch{
//       setSuggestion([]);
//     }
//   }
// const fetchWeatherData=async (URL,name='')=>{
//   setError('');
//   setWeather(null);
//   try{
//     const response= await fetch(url);
//     if(response.ok) throw new Error((await response.json()).message || 'City not Found')
//       const data= await.response.json();
//     setWeather(data);
//     setCity(name|| data.name)
//     setSuggestion([]);

//   }
//   catch(err){
//     setError(err.message)
//   }
// }
// // prevents form submission validates city and fetches data
// const handleSearch= async(e)=>{
//   e.preventDefault();
//   if(!city.trim()) return setError("Please enter valid city name");
//   await fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&appid=$appid=${API key}$units=metric`

//   )
// }
//   const getWeatherCondition = () =>
//     weather && ({
//       main: weather.weather[0].main,
//       isDay: Date.now() / 1000 > weather.sys.sunrise && Date.now() / 1000 < weather.sys.sunset
//     })

//   return (
//     <div className="min-h-screen">
//       <WeatherBackground condition={getWeatherCondition()} />
//       <div className="flex items-center justify-center p-6 min-h-screen">
//         <div className="bg-transparent backdrop-filter backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-md text-white w-full border border-white/30 relative z-10">
//           <h1 className="text-4xl font-extrabold text-center mb-6">Weather App</h1>
//           {weather ?(
//             <form onSubmit={handleSearch} className=' flex flex=col relative'>
//               <input value={city} onChange={(e)=> setCity(e.target.value)} placeholder='Enter City or Country(min 3 letters)'
//               className='mb-4 p-3 rounded border border-white bg-transparent text-white placeholder-white focus:outline-null focus:border-blue-300 transition duration-300'/>
//               {suggestion.length>0 &&(
//                 <div className='absolute top-12 left-0 right-0 bg-transparent shadow-md rounded z-10'>
//                   {suggestion.map((s)=> (
//                     <button type='button' key={`${s.lat}-${s.lon}`}
//                     onClick={()=> fetchWeatherData(
//                       `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon={s.lon}&appid={API_key}&units=metric`,`${s.name}, ${s.country}${s.state ? `, ${s.state}`: ''}`
//                       )}
//                       className='block hover:bg-blue-700 bg-transparent px-4 py-2 text-sm text-left w-full transition-colors'>
//                     {s.name},{s.country}{s.state && `,${s.state}`}

//                     </button>
//                   ))}
//                 </div>
//               )}
// <button type='submit' classNode=' bg-purple-700 hover:bg-blue-700 text-white font-semibold py2 px-4 rounded transition-colors'>
// Get Weather
// </button>
//             </form>
//           ):(
//             <div classNode='mt-6 text-center transition-opacity duration- 500'>
//               <button onClick={()=> {setWeather(null); setCity('')}}
//               className=' mb-4 bg-purple-900 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded transition-colors'>
//                 New Search
//               </button>
//               <div className='flex justify-between items-center'>
//                 <h2 className='text-3x1 font-bold'>

//                 </h2>
//                 <button onClick ={()=> setUnit(u=> u==='C' ?'F':'C')}>
//                   className=' bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1 px-3 rounded transition-colors'>
//                   &deg;{unit}
//                 </button>
//                 </div>
//                 <img src={'https: //api.openweathermap.org/img/wn/${weather.weather[0].icon}@2px.png'}alt={weather.weather[0].description}
//                 className='mx-auto my-4 animate-bounce'/>
//                 <p className=' text-4x1'>
//                   {convertTemperature(weather.main.temp, unit)} &deg;{unit}
//                 </p>
//                 <p className=' capitalize'>{weather.weather[0].descrption}</p>
//                 </div>
//           )}

//         </div>
//       </div>
//     </div>
//   )
// }

// export default App
//</div> import React, { useState } from 'react';
// import WeatherBackground from './Component/Weatherbackground';

// const App = () => {
//   const [weather, setWeather] = useState(null);
//   const [city, setCity] = useState('');
//   const [suggestion, setSuggestion] = useState([]);

//   const API_key = 'c21f60f511bcd7520be924d973015f0c';

//   const getWeatherCondition = () =>
//     weather && {
//       main: weather.weather[0].main,
//       isDay:
//         Date.now() / 1000 > weather.sys.sunrise &&
//         Date.now() / 1000 < weather.sys.sunset,
//     };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (city.length < 3) return;

//     try {
//       const res = await fetch(
//         `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_key}`
//       );
//       const data = await res.json();
//       setSuggestion(data);
//     } catch (err) {
//       console.error('Failed to fetch suggestions:', err);
//     }
//   };

//   const fetchWeatherData = async (url, name) => {
//     try {
//       const res = await fetch(url);
//       const data = await res.json();
//       setWeather(data);
//       setCity(name);
//       setSuggestion([]);
//     } catch (err) {
//       console.error('Failed to fetch weather:', err);
//     }
//   };

//   return (
//     <div className="min-h-screen">
//       <WeatherBackground condition={getWeatherCondition()} />
//       <div className="flex items-center justify-center p-6 min-h-screen">
//         <div className="bg-transparent backdrop-filter backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-md text-white w-full border border-white/30 relative z-10">
//           <h1 className="text-4xl font-extrabold text-center mb-6">Weather App</h1>

//           {</div>!weather ? (
//             <form onSubmit={handleSearch} className="flex flex-col relative">
//               <input
//                 value={city}
//                </form> onChange={(e) => setCity(e.target.value)}
//                 placeholder="Enter city (min 3 letters)"
//                 className="mb-4 p-3 rounded border border-white bg-transparent text-white placeholder-white focus:outline-none focus:border-blue-300 transition duration-300"
//               />
//               {suggestion.length > 0 && (
//                 <div className="absolute top-16 left-0 right-0 bg-white bg-opacity-10 shadow-md rounded z-10">
//                   {suggestion.map((s) => (
//                     <button
//                       key={`${s.lat}-${s.lon}`}
//                       type="button"
//                       onClick={() =>
//                         fetchWeatherData(
//                           `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid=${API_key}&units=metric`,
//                           `${s.name}, ${s.country}${s.state ? `, ${s.state}` : ''}`
//                         )
//                       }
//                       className="block hover:bg-blue-700 bg-transparent px-4 py-2 text-sm text-left w-full transition-colors text-white"
//                     >
//                       {s.name}, {s.country}
//                       {s.state && `, ${s.state}`}
//                     </button>
//                   ))}
//                 </div>
//               )}
//               <button
//                 type="submit"
//                 className="bg-purple-700 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors mt-2"
//               >
//                 Get Weather
//               </button>
//             </form>
//           ) : (
//             <div className="mt-6 text-center transition-opacity duration-500">
//               <h2 className="text-2xl font-semibold mb-4">
//                 {weather.name}, {weather.sys.country}
//               </h2>
//               <p className="text-lg">Temp: {weather.main.temp}°C</p>
//               <p className="text-lg">Condition: {weather.weather[0].main}</p>
//               <button
//                 onClick={() => setWeather(null)}
//                 className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
//               >
//                 Search Another City
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;
// import React, { useState, useEffect } from 'react';
// import WeatherBackground from './Component/Weatherbackground';

// const App = () => {
//   const [weather, setWeather] = useState(null);
//   const [city, setCity] = useState('');
//   const [suggestion, setSuggestion] = useState([]);
//   const [unit, setUnit] = useState('C');
//   const [error, setError] = useState('');
//   const API_key = 'c21f60f511bcd7520be924d973015f0c';

//   useEffect(() => {
//     if (city.trim().length >= 3 && !weather) {
//       const timer = setTimeout(() => fetchSuggestions(city), 500);
//       return () => clearTimeout(timer);
//     }
//     setSuggestion([]);
//   }, [city, weather]);

//   const fetchSuggestions = async (query) => {
//     try {
//       const res = await fetch(
//         `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_key}`
//       );
//       res.ok ? setSuggestion(await res.json()) : setSuggestion([]);
//     } catch {
//       setSuggestion([]);
//     }
//   };

//   const fetchWeatherData = async (url, name = '') => {
//     setError('');
//     setWeather(null);
//     try {
//       const response = await fetch(url);
//       if (!response.ok)
//         throw new Error((await response.json()).message || 'City not Found');
//       const data = await response.json();
//       setWeather(data);
//       setCity(name || data.name);
//       setSuggestion([]);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!city.trim()) return setError('Please enter valid city name');
//     await fetchWeatherData(
//       `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&appid=${API_key}&units=metric`
//     );
//   };

//   const convertTemperature = (temp, unit) =>
//     unit === 'C' ? temp.toFixed(1) : ((temp * 9) / 5 + 32).toFixed(1);

//   const getWeatherCondition = () =>
//     weather && {
//       main: weather.weather[0].main,
//       isDay:
//         Date.now() / 1000 > weather.sys.sunrise &&
//         Date.now() / 1000 < weather.sys.sunset,
//     };

//   return (
//     <div className="min-h-screen">
//       <WeatherBackground condition={getWeatherCondition()} />
//       <div className="flex items-center justify-center p-6 min-h-screen">
//         <div className="bg-transparent backdrop-filter backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-md text-white w-full border border-white/30 relative z-10">
//           <h1 className="text-4xl font-extrabold text-center mb-6">Weather App</h1>

//           {!weather ? (
//             <form onSubmit={handleSearch} className="flex flex-col relative">
//               <input
//                 value={city}
//                 onChange={(e) => setCity(e.target.value)}
//                 placeholder="Enter City or Country(min 3 letters)"
//                 className="mb-4 p-3 rounded border border-white bg-transparent text-white placeholder-white focus:outline-none focus:border-blue-300 transition duration-300"
//               />
//               {suggestion.length > 0 && (
//                 <div className="absolute top-12 left-0 right-0 bg-transparent shadow-md rounded z-10">
//                   {suggestion.map((s) => (
//                     <button
//                       type="button"
//                       key={`${s.lat}-${s.lon}`}
//                       onClick={() =>
//                         fetchWeatherData(
//                           `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid=${API_key}&units=metric`,
//                           `${s.name}, ${s.country}${s.state ? `, ${s.state}` : ''}`
//                         )
//                       }
//                       className="block hover:bg-blue-700 bg-transparent px-4 py-2 text-sm text-left w-full transition-colors"
//                     >
//                       {s.name}, {s.country}
//                       {s.state && `, ${s.state}`}
//                     </button>
//                   ))}
//                 </div>
//               )}
//               <button
//                 type="submit"
//                 className="bg-purple-700 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
//               >
//                 Get Weather
//               </button>
//               {error && <p className="mt-2 text-red-400">{error}</p>}
//             </form>
//           ) : (
//             <div className="mt-6 text-center transition-opacity duration-500">
//               <button
//                 onClick={() => {
//                   setWeather(null);
//                   setCity('');
//                 }}
//                 className="mb-4 bg-purple-900 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded transition-colors"
//               >
//                 New Search
//               </button>

//               <div className="flex justify-between items-center">
//                 <h2 className="text-3xl font-bold">{city}</h2>
//                 <button
//                   onClick={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))}
//                   className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1 px-3 rounded transition-colors"
//                 >
//                   &deg;{unit}
//                 </button>
//               </div>

//               <img
//                 src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
//                 alt={weather.weather[0].description}
//                 className="mx-auto my-4 animate-bounce"
//               />
//               <p className="text-4xl">
//                 {convertTemperature(weather.main.temp, unit)} &deg;{unit}
//               </p>
//               <p className="capitalize">{weather.weather[0].description}</p>
//               <div className= 'flex flex-wrap justify-around mt-6'>
//                 {[
//                   [HumidtyIcon, 'Humidty', `${weather.main.humidity}% (${getHumidityValue(weather.main.humidty)})`],
//                   [WindIcon, 'Wind', `${weather.wind.speed}m/s ${weather.wind.deg ? `(${getHumidityValue(weather.main.humidty)})` : ''}`],
//                   [VisibilityIcon, 'Visibility', getVisibilityValue(weather.visibility)]
//                 ].map(([IconBase, LiaBell,value])=>(
//                   <div key={label} className=' flex flex-col items-center m-2'>
//                     <Icon/>
//                     <p className=' mt-1 font-semibold'>{label}</p>
//                     <p className=' text-sm'>{value}</p>
//                   </div>
//                 ))}
//                 </div>
//                 <div className='flex flex-wrap justify-around mt-6'>
//                   {[
//                     [SunriseIcon, 'Sunrise', weather.sys.sunrise],
//                     [SunsetIcon, 'Sunset', weather.sys.sunset]
//                   ].map(([Icon,label,time])=>(
//                     <div key={label} className='flex flex-col items-center m-2'>
//                       <Icon/>
//                       <p className=' mt-1 font-semibold'>{label}</p>
//                       <p className='text-sm'>
//                         {new Date(time*1000).toLocaleDateString('en-GB',
//                           {hour: '2-digit', minute: '2-digit'})}

                        
//                       </p>
//                       </div>

//                   ))}
//                   </div>
//                   <div className='mt-6 text-sm'>
//                     <p><strong>Feels Like:</strong>{convertTemperature(weather.main.feels_like,unit)}& deg;{unit}</p>
//                     <p><strong>Pressure:</strong>{weather.main.pressure}hPa</p>
//             </div>
//           )}
//           {error && <p className='text-red-400 text-center mt-4'>{error}</p>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;


