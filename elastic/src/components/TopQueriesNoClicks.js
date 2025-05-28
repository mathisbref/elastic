import React, { useState, useEffect, useCallback } from 'react';

const TopQueriesNoClicks = ({ dateRange, pageSize }) => {
  const [queriesNoClicks, setQueriesNoClicks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTopQueriesNoClicks = useCallback(async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.REACT_APP_ELASTIC_SEARCH_BASE_URL;
      const engineName = process.env.REACT_APP_ELASTIC_SEARCH_ENGINE_NAME;
      const authToken = process.env.REACT_APP_ELASTIC_SEARCH_AUTH_TOKEN;

      if (!baseUrl || !engineName || !authToken) {
        throw new Error('Les variables d’environnement ne sont pas correctement configurées.');
      }

      const response = await fetch(
        `${baseUrl}/api/as/v1/engines/${engineName}/analytics/queries`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            filters: {
              date: {
                from: dateRange.from.toISOString(),
                to: dateRange.to.toISOString(),
              },
            },
            page: {
              size: pageSize,
            },
          }),
        }
      );

      const data = await response.json();
      console.log('Données des top queries:', data);
      if (response.ok) {
        // Filtrer les requêtes avec clicks === 0
        const noClickQueries = (data.results || []).filter(query => query.clicks === 0);
        setQueriesNoClicks(noClickQueries);
      } else {
        console.error('Erreur API:', data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des top queries sans clics:', error);
      setLoading(false);
    }
  }, [dateRange, pageSize]);

  useEffect(() => {
    fetchTopQueriesNoClicks();
  }, [fetchTopQueriesNoClicks]);

  if (loading) {
    return <p>Chargement des données...</p>;
  }

  return (
    <div>
      <h2>Top Queries sans Clicks</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Requête</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Nombre de Requêtes</th>
          </tr>
        </thead>
        <tbody>
          {queriesNoClicks.length === 0 ? (
            <tr>
              <td colSpan="2" style={{ textAlign: 'center' }}>Aucune donnée disponible pour les top queries sans clicks.</td>
            </tr>
          ) : (
            queriesNoClicks.map((query, index) => (
              <tr key={index}>
                <td>{query.term}</td>
                <td>{query.queries}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TopQueriesNoClicks;