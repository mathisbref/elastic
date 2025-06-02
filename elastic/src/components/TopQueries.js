import React, { useEffect, useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './TopQueries.css';
import TopQueriesNoClicks from './TopQueriesNoClicks'; // Import du nouveau composant

const TopQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(40);
  const [dateRange, setDateRange] = useState({
    from: new Date('2025-01-01T00:00:00Z'),
    to: new Date('2025-12-31T23:59:59Z'),
  });
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchTopQueries = useCallback(async () => {
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
      if (response.ok) {
        setQueries(data.results || []);
      } else {
        console.error('Erreur API:', data);
      }
      setLoading(false);
      setIsFirstLoad(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des top queries:', error);
      setLoading(false);
      setIsFirstLoad(false);
    }
  }, [dateRange, pageSize]);

  useEffect(() => {
    if (isFirstLoad) {
      fetchTopQueries();
    }
  }, [fetchTopQueries, isFirstLoad]);

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTopQueries();
  };

  if (loading) {
    return <p>Chargement des données...</p>;
  }

  return (
    <div>
      <h1>Top Queries</h1>

      {/* Bandeau de recherche */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <label>
          Date de début :
          <DatePicker
            selected={dateRange.from}
            onChange={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
            dateFormat="yyyy-MM-dd"
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            portalId="root-portal"
          />
        </label>
        <label>
          Date de fin :
          <DatePicker
            selected={dateRange.to}
            onChange={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
            dateFormat="yyyy-MM-dd"
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            portalId="root-portal"
          />
        </label>
        <label>
          Nombre de résultats :
          <input
            type="number"
            value={pageSize}
            onChange={handlePageSizeChange}
            min="1"
            max="999"
          />
        </label>
        <button type="submit">Rechercher</button>
      </form>

      {/* Tableau des résultats */}
      <h2>Top Queries avec Résultats</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Requête</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Nombre de Requêtes</th>
          </tr>
        </thead>
        <tbody>
          {queries.length === 0 ? (
            <tr>
              <td colSpan="2" style={{ textAlign: 'center' }}>Aucune donnée disponible pour les top queries.</td>
            </tr>
          ) : (
            queries.map((query, index) => (
              <tr key={index}>
                <td>{query.term}</td>
                <td>{query.queries}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Affichage du composant TopQueriesNoClicks */}
      <TopQueriesNoClicks dateRange={dateRange} pageSize={pageSize} />
    </div>
  );
};

export default TopQueries;