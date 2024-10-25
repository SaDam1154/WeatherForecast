import { useState } from 'react';
import axios from 'axios';
import { CurrentWeather, ForecastWeather, ApiResponse } from '../../types/weather';
import { toast } from 'react-toastify';
import { removeVietnameseDiacritics } from '../../utils/removeVietnameseDiacritics';

const Home = () => {
    const [city, setCity] = useState('');
    const [email, setEmail] = useState('');
    const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
    const [forecastWeather, setForecastWeather] = useState<ForecastWeather[]>([]);
    const [errorCity, setErrorCity] = useState('');
    const [errorEmail, setErrorEmail] = useState('');
    const [days, setDays] = useState(4);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingLocation, setloadingLocation] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingLoadmore, setLoadingLoadmore] = useState(false);
    const [loadingSubscrise, setLoadingSubscrise] = useState(false);
    const [loadingUnSubscrise, setLoadingUnSubscrise] = useState(false);

    const showSuccessNoti = () => toast.success('Searching successed!');
    const showErorrNoti = () => toast.error('Searching failed!');
    const showNotFoundCityNoti = () => toast.error('City not found!');
    const showNotFoundEmailNoti = () => toast.error('Email not found!');

    // Thêm hàm để kiểm tra dữ liệu trong localStorage
    const getWeatherFromLocalStorage = (city: string) => {
        const weatherData = localStorage.getItem(city);
        if (weatherData) {
            const parsedData = JSON.parse(weatherData);
            const today = new Date().toDateString(); // Lấy ngày hôm nay
            if (parsedData.date === today) {
                return parsedData; // Nếu dữ liệu đã tồn tại và là hôm nay, trả về dữ liệu
            }
        }
        return null; // Không có dữ liệu cho hôm nay
    };

    const handleSearch = async () => {
        setLoading(true);
        setLoadingSearch(true);

        if (!city) {
            setErrorCity('Please enter a city name');
            showNotFoundEmailNoti();
            setLoading(false);
            setLoadingSearch(false);

            return;
        }

        // Kiểm tra xem có dữ liệu trong localStorage không
        const localWeatherData = getWeatherFromLocalStorage(city);
        if (localWeatherData) {
            // Nếu có dữ liệu, sử dụng dữ liệu từ localStorage
            setCurrentWeather(localWeatherData.currentWeather);
            setForecastWeather(localWeatherData.forecastWeather);
            toast.success('Display weather information history temporarily!');
            setLoading(false);
            setLoadingSearch(false);
            return; // Kết thúc hàm nếu đã có dữ liệu
        }

        try {
            // Fetch current weather
            const currentResponse = await axios.get<ApiResponse>(`https://weatherforecastbe.onrender.com/api/weather/current?city=${city}`);

            setDays(4);
            // Fetch forecast weather
            const forecastResponse = await axios.get<ApiResponse>(
                `https://weatherforecastbe.onrender.com/api/weather/forecast?city=${city}&days=${days}`
            );

            if (currentResponse.data.success && forecastResponse.data.success) {
                setCurrentWeather(currentResponse.data.currentWeather || null);
                setForecastWeather(forecastResponse.data.forecastWeather || []);
                setErrorCity('');
                showSuccessNoti();

                // Lưu trữ dữ liệu vào localStorage
                const weatherDataToStore = {
                    date: new Date().toDateString(), // Lưu ngày
                    currentWeather: currentResponse.data.currentWeather,
                    forecastWeather: forecastResponse.data.forecastWeather,
                };
                localStorage.setItem(city, JSON.stringify(weatherDataToStore)); // Lưu dữ liệu vào localStorage
            } else {
                setErrorCity('Weather data not found.');
            }
        } catch {
            setErrorCity('Could not fetch weather data. Please try again.');
            showErorrNoti();
        } finally {
            setLoading(false);
            setLoadingSearch(false);
        }
    };

    const handleSearchWithCurrentLocation = () => {
        setLoading(true);
        setloadingLocation(true);
        setCity(' ');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    console.log(latitude, longitude);

                    try {
                        // Gọi API để lấy tên thành phố dựa vào tọa độ
                        const locationResponse = await axios.get(
                            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=07823c70b27244cab6236c21deea504c&language=en&pretty=1`
                        );
                        console.log(locationResponse.data);
                        const cityName = locationResponse.data.results[0].components.city || '';

                        setCity(removeVietnameseDiacritics(cityName)); // Cập nhật tên thành phố
                    } catch (error) {
                        console.error('Error retrieving city from location:', error);
                        setErrorCity('Error retrieving city from location.');
                    } finally {
                        setLoading(false);
                        setloadingLocation(false);
                    }
                },
                (error) => {
                    console.error('Error retrieving location', error);
                    alert('Không thể lấy được vị trí. Vui lòng kiểm tra cài đặt vị trí.');
                }
            );
        } else {
            alert('Trình duyệt này không hỗ trợ định vị.');
            setLoading(false);
            setloadingLocation(false);
        }
    };
    const handleSubscribeEmail = async () => {
        setLoading(true);
        setLoadingSubscrise(true);

        if (!city) {
            setErrorCity('Please enter a city name');
            showNotFoundCityNoti();
            setLoading(false);
            setLoadingSubscrise(false);
            return;
        }
        if (!email) {
            setErrorEmail('Please enter your email');
            showNotFoundCityNoti();
            setLoading(false);
            setLoadingSubscrise(false);
            return;
        }
        console.log('search', city);
        try {
            // Gửi yêu cầu đăng ký thời tiết
            const response = await axios.post(
                'https://weatherforecastbe.onrender.com/api/subscribe/',
                {
                    email: email,
                    city: city,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Kiểm tra thành công và hiển thị thông báo
            if (response.data.success) {
                toast.success(response.data.message); // Hiển thị thông báo thành công từ API
                setErrorEmail('');
            } else {
                toast.error(response.data.message); // Hiển thị thông báo lỗi từ API
                setErrorEmail(response.data.message);
            }
        } catch {
            setErrorEmail('Could not subscribe with this email. Please try again.');
            toast.error('Could not subscribe with this email. Please try again.'); // Hiển thị thông báo lỗi từ API
        } finally {
            setLoading(false);
            setLoadingSubscrise(false);
        }
    };

    const handleUnsubscribeEmail = async () => {
        setLoading(true);
        setLoadingUnSubscrise(true);

        if (!email) {
            setErrorEmail('Please enter your email');
            showNotFoundCityNoti();
            setLoading(false);
            setLoadingUnSubscrise(false);
            return;
        }
        console.log('search', city);
        try {
            // Gửi yêu cầu đăng ký thời tiết
            const response = await axios.post(
                'https://weatherforecastbe.onrender.com/api/subscribe/unsub',
                {
                    email: email,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Kiểm tra thành công và hiển thị thông báo
            if (response.data.success) {
                toast.success(response.data.message); // Hiển thị thông báo thành công từ API
                setErrorEmail('');
            } else {
                toast.error(response.data.message); // Hiển thị thông báo lỗi từ API
                setErrorEmail(response.data.message);
            }
        } catch {
            setErrorEmail('Could not subscribe with this email. Please try again.');
            toast.error('Could not subscribe with this email. Please try again.'); // Hiển thị thông báo lỗi từ API
        } finally {
            setLoading(false);
            setLoadingUnSubscrise(false);
        }
    };

    const loadMore = async () => {
        setLoading(true);
        setLoadingLoadmore(true);

        const newDays = days + 4; // Tăng số ngày lên 2
        try {
            // Fetch thêm forecast weather
            const forecastResponse = await axios.get<ApiResponse>(
                `https://weatherforecastbe.onrender.com/api/weather/forecast?city=${city}&days=${newDays}`
            );

            if (forecastResponse.data.success) {
                // Cập nhật số ngày và dữ liệu dự báo
                setDays(newDays);

                // Kiểm tra nếu forecastWeather tồn tại và là một mảng
                if (forecastResponse.data.forecastWeather) {
                    setForecastWeather(forecastResponse.data.forecastWeather);
                    setHasMore(forecastResponse.data.forecastWeather.length > 0); // Kiểm tra nếu còn dữ liệu
                } else {
                    setForecastWeather([]); // Hoặc xử lý trường hợp không có dữ liệu
                    setHasMore(false);
                }
            } else {
                setErrorCity('Could not load more forecast data.');
            }
        } catch {
            setErrorCity('Could not fetch more weather data. Please try again.');
        } finally {
            setLoading(false);
            setLoadingLoadmore(false);
        }
    };

    return (
        <div className='flex flex-col gap-20 sm:gap-2 w-full min-h-screen h-auto mx-auto bg-customBackground rounded-lg'>
            <div className='h-auto mb-20 sm:mb-2 p-4 bg-customBlue'>
                <h1 className='h-fit text-3xl leading-7  font-bold text-center text-white bg-customBlue'>Weather Dashboard</h1>
            </div>

            <div className='h-auto flex flex-col gap-20 p-6 sm:flex-row justify-center sm:gap-20 sm:p-6'>
                <div className='w-full h-auto flex flex-col justify-center sm:justify-start items-center sm:w-96 max-h-44 mb-6'>
                    <div className='mb-2 w-full'>
                        <label htmlFor='city' className='mb-1 block font-medium text-gray-900 '>
                            Enter a City Name
                        </label>
                        <input
                            type='text'
                            name='city'
                            id='city'
                            className='text-input'
                            placeholder='Enter city name'
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                        <span className='select-none text-sm text-red-500'>{errorCity}</span>
                    </div>

                    <div className='w-full flex flex-col gap-2 items-center'>
                        <button onClick={handleSearch} className='btn btn-blue btn-md mt-4 w-full' disabled={loadingSearch || loading}>
                            {!loadingSearch ? (
                                <span>Search</span>
                            ) : (
                                <div className='flex items-center gap-1'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        strokeWidth='1.5'
                                        stroke='currentColor'
                                        className='h-4 w-4 animate-spin'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z'
                                        />
                                    </svg>
                                    <span className=''>Searching</span>
                                </div>
                            )}
                        </button>
                    </div>
                    <div className='w-full flex flex-col gap-2 items-center'>
                        <button
                            onClick={handleSearchWithCurrentLocation}
                            className='btn btn-gray btn-md mt-4 w-full'
                            disabled={loadingLocation || loading}
                        >
                            {!loadingLocation ? (
                                <span>use Current Location</span>
                            ) : (
                                <div className='flex items-center gap-1'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        strokeWidth='1.5'
                                        stroke='currentColor'
                                        className='h-4 w-4 animate-spin'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z'
                                        />
                                    </svg>
                                    <span className=''>Searching Current Location</span>
                                </div>
                            )}
                        </button>
                    </div>
                    <div className='mb-2 mt-4 w-full'>
                        <label htmlFor='email' className='mb-1 block font-medium text-gray-900 '>
                            Enter Email
                        </label>
                        <input
                            type='text'
                            name='email'
                            id='email'
                            className='text-input'
                            placeholder='Enter email to receive daily weather forecast'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSubscribeEmail();
                                }
                            }}
                        />
                        <span className='select-none text-sm text-red-500'>{errorEmail}</span>
                    </div>
                    <div className='w-full h-fit flex-col sm:flex-row mb-10 gap-2 p2 items-center'>
                        <button
                            onClick={handleSubscribeEmail}
                            className='btn btn-green btn-md mt-4 w-full'
                            disabled={loadingSubscrise || loading}
                        >
                            {!loadingSubscrise ? (
                                <span>Subcrise</span>
                            ) : (
                                <div className='flex items-center gap-1'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        strokeWidth='1.5'
                                        stroke='currentColor'
                                        className='h-4 w-4 animate-spin'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z'
                                        />
                                    </svg>
                                    <span className=''>Subcrising</span>
                                </div>
                            )}
                        </button>
                        <button
                            onClick={handleUnsubscribeEmail}
                            className='btn btn-red btn-md mt-4 mb-10 w-full'
                            disabled={loadingUnSubscrise || loading}
                        >
                            {!loadingUnSubscrise ? (
                                <span>Unsubcrise</span>
                            ) : (
                                <div className='flex items-center gap-1'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        fill='none'
                                        viewBox='0 0 24 24'
                                        strokeWidth='1.5'
                                        stroke='currentColor'
                                        className='h-4 w-4 animate-spin'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            d='M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z'
                                        />
                                    </svg>
                                    <span className=''>Unubcrising</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {currentWeather && (
                    <div className='flex flex-col w-full max-w-[820px]'>
                        <div className='flex justify-between bg-customBlue text-white p-4 pl-10 pr-20 rounded mb-6'>
                            <div className='flex-col'>
                                <h2 className='text-xl font-bold mb-2'>
                                    {currentWeather.city} ({currentWeather.lastUpdated.split(' ')[0]})
                                </h2>
                                <p>Temperature: {currentWeather.temperature}°C</p>
                                <p>Wind: {currentWeather.wind_speed} M/S</p>
                                <p>Humidity: {currentWeather.humidity}%</p>
                            </div>
                            <div className='flex flex-col items-center justify-center'>
                                <img
                                    src={currentWeather.conditionIcon}
                                    className='w-20 h-20 object-contain'
                                    alt={currentWeather.conditionText}
                                />
                                <p>{currentWeather.conditionText}</p>
                            </div>
                        </div>

                        {forecastWeather.length > 0 && (
                            <>
                                <h3 className='text-2xl font-semibold mb-4'>{forecastWeather.length}-Day Forecast</h3>
                                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4'>
                                    {forecastWeather.map((day, index) => (
                                        <div key={index} className='flex flex-col bg-gray-200 p-4 rounded'>
                                            <h4 className='font-bold mb-2'>({day.date})</h4>
                                            <img src={day.conditionIcon} className='w-14 h-14 object-contain' alt={day.conditionText} />
                                            <p>Temp: {day.temperature}°C</p>
                                            <p>Wind: {day.wind_speed} M/S</p>
                                            <p>Humidity: {day.humidity}%</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {hasMore && forecastWeather.length > 0 && (
                            <div className='mt-6 text-center'>
                                <button
                                    onClick={loadMore}
                                    className='bg-blue-600 text-white py-2 px-4 rounded'
                                    disabled={loadingLoadmore || loading}
                                >
                                    {!loadingLoadmore ? (
                                        <span>Load More</span>
                                    ) : (
                                        <div className='flex items-center gap-1'>
                                            <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                                strokeWidth='1.5'
                                                stroke='currentColor'
                                                className='h-4 w-4 animate-spin'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    d='M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z'
                                                />
                                            </svg>
                                            <span className=''>Loading more...</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
