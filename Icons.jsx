import React from 'react';
import WindIconSrc from '../assets/Wind.png';
import HumidityIconSrc from '../assets/Humidity.png';
import VisibilityIconSrc from '../assets/Visibility.png';
import SunriseIconSrc from '../assets/Sunrise.png';
import SunsetIconSrc from '../assets/Sunset.png';

const Icon=({src, alt, className})=> (
    <img src={src} alt={alt} className={`h-8 w-8 inline-block ${className}`}/>
)
export const WindIcon = () => <Icon src={WindIconSrc} alt="Wind" className="animate-icon svg-hover" />;
export const HumidityIcon = () => <Icon src={HumidityIconSrc} alt="Humidity" className="powerful-pulse svg-hover" />;
export const VisibilityIcon = () => <Icon src={VisibilityIconSrc} alt="Visibility" className="powerful-pulse svg-hover" />;
export const SunriseIcon = () => <Icon src={SunriseIconSrc} alt="Sunrise" className="powerful-pulse svg-hover" />;
export const SunsetIcon = () => <Icon src={SunsetIconSrc} alt="Sunset" className="powerful-pulse svg-hover" />;