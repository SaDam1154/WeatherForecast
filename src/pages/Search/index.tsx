import { useState } from 'react';
import axios from 'axios';

const Search = () => {
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!city) {
            setError('Please enter a city name');
            return;
        }

        try {
            const response = await axios.get(`https://weatherforecastbe.onrender.com/api/weather/current?city=${city}`);
            setWeatherData(response.data);
            setError('');
        } catch (err) {
            setError('Could not fetch weather data. Please try again.');
            setWeatherData(null);
        }
    };

    return (
        <div>
            <input type='text' placeholder='Enter city name' value={city} onChange={(e) => setCity(e.target.value)} />
            <button onClick={handleSearch}>Search</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {weatherData && (
                <div>
                    <h3>Weather in {weatherData.city}</h3>
                    <p>Temperature: {weatherData.temperature} °C</p>
                    <p>Condition: {weatherData.condition}</p>
                </div>
            )}
        </div>
    );
};

export default Search;
