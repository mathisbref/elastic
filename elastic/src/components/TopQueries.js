import React, { useEffect, useState } from 'react';

const TopQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(40); // Nombre de top queries à afficher
  const [dateRange, setDateRange] = useState({
    from: '2023-01-01T00:00:00Z', // Date de début par défaut
    to: '2025-12-31T23:59:59Z',   // Date de fin par défaut
  });

  const fetchTopQueries = async () => {
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
                from: dateRange.from, // Utilise la plage de dates sélectionnée
                to: dateRange.to,
              },
            },
            page: {
              size: pageSize, // Utilise le nombre de résultats sélectionné
            },
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setQueries(data.results || []);
      } else {
        console.error('Erreur API:', data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des top queries:', error);
      setLoading(false);
    }
  };

  // Appel initial pour charger les données par défaut
  useEffect(() => {
    fetchTopQueries();
  }, []);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: `${value}:00Z`,
    }));
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
  };

  const handleSearch = () => {
    fetchTopQueries(); // Recharge les données avec les nouveaux paramètres
  };

  if (loading) {
    return <p>Chargement des données...</p>;
  }

  if (queries.length === 0) {
    return <p>Aucune donnée disponible pour les top queries.</p>;
  }

  return (
    <div>
      <h1>Top Queries</h1>

      {/* Contrôles pour la plage de dates et le nombre de résultats */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          Date de début :
          <input
            type="datetime-local"
            name="from"
            value={dateRange.from.slice(0, 16)} // Format pour datetime-local
            onChange={handleDateChange}
          />
        </label>
        <label>
          Date de fin :
          <input
            type="datetime-local"
            name="to"
            value={dateRange.to.slice(0, 16)} // Format pour datetime-local
            onChange={handleDateChange}
          />
        </label>
        <label>
          Nombre de résultats :
          <input
            type="number"
            value={pageSize}
            onChange={handlePageSizeChange}
            min="1"
            max="100"
          />
        </label>
        <button onClick={handleSearch}>Rechercher</button>
      </div>

      {/* Tableau des résultats */}
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