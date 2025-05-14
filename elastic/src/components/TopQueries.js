import React, { useEffect, useState } from 'react';

const TopQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopQueries = async () => {
      try {
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
              page: {
                size: 80,
              },
            }),
          }
        );
    
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
    
        if (response.ok) {
          setQueries(data.results || []); // Assurez-vous que `data.results` contient les données attendues
        } else {
          console.error('Erreur API:', data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des top queries:', error);
        setLoading(false);
      }
    };

    fetchTopQueries();
  }, []);

  if (loading) {
    return <p>Chargement des données...</p>;
  }

  return (
    <div>
      <h1>Top 40 Queries</h1>
      <table>
        <thead>
          <tr>
            <th>Requête</th>
            <th>Nombre de Requêtes</th>
          </tr>
        </thead>
        <tbody>
          {queries.map((query, index) => (
            <tr key={index}>
              <td>{query.term}</td>
              <td>{query.queries}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopQueries;