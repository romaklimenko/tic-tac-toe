import { useState, useEffect } from 'react';
import type { GameData } from '../types';

export function useGameState(board: string) {
    const [data, setData] = useState<GameData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);

        // Use base URL to ensure correct path in production
        const baseUrl = import.meta.env.BASE_URL;
        const url = `${baseUrl}data/${board}.json`;

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to load state: ${res.statusText}`);
                return res.json();
            })
            .then(json => {
                if (isMounted) {
                    setData(json);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (isMounted) {
                    setError(err);
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [board]);

    return { data, loading, error };
}
