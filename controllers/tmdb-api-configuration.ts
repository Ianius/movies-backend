import { fetchJSON } from '../utils/network';
import { elapsedInHours } from '../utils/time';

interface APIConfiguration {
    images: {
        base_url: string;
        secure_base_url: string;
        backdrop_sizes: string[];
        logo_sizes: string[];
        poster_sizes: string[];
        profile_sizes: string[];
        still_sizes: string[];
    };

    change_keys: string[];
    last_fetched: Date;
}

const CONFIG_FETCH_INTERVAL_HOURS = 24;

let configuration: APIConfiguration | undefined;

const fetchConfig = async (baseUrl: string, apiKey: string) => {
    configuration = await fetchJSON(`${baseUrl}/configuration?${apiKey}`);
    configuration!.last_fetched = new Date();
};

export const getApiConfiguration = async (baseUrl: string, apiKey: string) => {
    const now = new Date();
    const elapsedSinceLastFetch = 
        configuration ? elapsedInHours(configuration.last_fetched, now) : CONFIG_FETCH_INTERVAL_HOURS;

    // Fetch the configuration again every 24 hours
    if (!configuration || elapsedSinceLastFetch >= CONFIG_FETCH_INTERVAL_HOURS) 
        await fetchConfig(baseUrl, apiKey);

    return configuration!;
};
