import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const ModelEvaluationFramework = () => {
  // Raw data from the new table
  const rawData = [
    { name: "OLMoE-1B-7B-0125-Instruct", privacy: 57.5, efficiency: 100.0, openness: 100.0, qsar: 60.4 },
    { name: "Qwen2.5-7B-Instruct", privacy: 91.6, efficiency: 93.5, openness: 22.2, qsar: 75.7 },
    { name: "OLMo-2-0325-32B-Instruct", privacy: 59.4, efficiency: 28.9, openness: 100.0, qsar: 92.0 },
    { name: "Falcon3-7B-Instruct", privacy: 79.1, efficiency: 84.1, openness: 27.8, qsar: 77.6 },
    { name: "Falcon3-10B-Instruct", privacy: 85.3, efficiency: 63.5, openness: 27.8, qsar: 83.2 },
    { name: "Llama-3.1-Tulu-3.1-8B", privacy: 35.8, efficiency: 79.5, openness: 44.5, qsar: 90.5 },
    { name: "Phi-4 (14B)", privacy: 100.0, efficiency: 58.6, openness: 27.8, qsar: 58.9 },
    { name: "Llama-3.1-8B-Instruct", privacy: 74.0, efficiency: 79.3, openness: 0.0, qsar: 74.5 },
    { name: "Mistral-7B-Instruct-v0.3", privacy: 40.9, efficiency: 71.2, openness: 27.8, qsar: 36.3 },
    { name: "Gemma-3-27b-it", privacy: 22.8, efficiency: 40.8, openness: 11.2, qsar: 100.0 },
    { name: "Qwen3-8B", privacy: 71.2, efficiency: 58.6, openness: 16.8, qsar: 26.8 },
    { name: "Qwen2.5-32B-Instruct", privacy: 25.2, efficiency: 38.2, openness: 22.2, qsar: 87.3 },
    { name: "Mistral-Small-3.1-24B-Instruct", privacy: 10.1, efficiency: 46.9, openness: 27.8, qsar: 84.4 },
    { name: "vicuna-13b-v1.5", privacy: 83.2, efficiency: 51.7, openness: 27.8, qsar: 5.4 },
    { name: "DeepSeek-R1-Distill-Qwen-14B", privacy: 63.2, efficiency: 45.8, openness: 22.2, qsar: 25.8 },
    { name: "Yi-1.5-34B-Chat", privacy: 32.0, efficiency: 29.3, openness: 33.4, qsar: 55.5 },
    { name: "salamandra-7b-instruct", privacy: 33.9, efficiency: 76.3, openness: 33.4, qsar: 4.4 },
    { name: "Lucie-7B-Instruct-v1.1", privacy: 0.0, efficiency: 87.0, openness: 33.4, qsar: 0.0 },
    { name: "Poro-34B-chat", privacy: 35.6, efficiency: 0.0, openness: 72.3, qsar: 2.7 },
    { name: "Qwen3-30B-A3B", privacy: 51.0, efficiency: 5.4, openness: 16.8, qsar: 25.3 }
  ];

  const [weights, setWeights] = useState({
    privacy: 0.25,
    efficiency: 0.25,
    openness: 0.25,
    qsar: 0.25
  });

  const [sortBy, setSortBy] = useState('composite');
  const [viewMode, setViewMode] = useState('table');
  const [scatterX, setScatterX] = useState('efficiency');
  const [scatterY, setScatterY] = useState('privacy');

  const processedData = useMemo(() => {
    return rawData.map(item => {
      const compositeScore = 
        (item.privacy * weights.privacy) +
        (item.efficiency * weights.efficiency) +
        (item.openness * weights.openness) +
        (item.qsar * weights.qsar);

      return {
        ...item,
        compositeScore: Math.round(compositeScore * 100) / 100,
        shortName: item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name
      };
    });
  }, [weights]);

  const sortedData = useMemo(() => {
    const sorted = [...processedData];
    switch(sortBy) {
      case 'privacy':
        return sorted.sort((a, b) => b.privacy - a.privacy);
      case 'efficiency':
        return sorted.sort((a, b) => b.efficiency - a.efficiency);
      case 'openness':
        return sorted.sort((a, b) => b.openness - a.openness);
      case 'qsar':
        return sorted.sort((a, b) => b.qsar - a.qsar);
      case 'composite':
      default:
        return sorted.sort((a, b) => b.compositeScore - a.compositeScore);
    }
  }, [processedData, sortBy]);

  const handleWeightChange = (metric, value) => {
    const numValue = parseFloat(value);
    const remaining = 1 - numValue;
    const otherMetrics = Object.keys(weights).filter(k => k !== metric);
    const otherSum = otherMetrics.reduce((sum, key) => sum + weights[key], 0);
    
    const newWeights = { ...weights, [metric]: numValue };
    
    // Distribute remaining weight proportionally among other metrics
    if (otherSum > 0) {
      otherMetrics.forEach(key => {
        newWeights[key] = (weights[key] / otherSum) * remaining;
      });
    } else {
      // If other weights are 0, distribute equally
      otherMetrics.forEach(key => {
        newWeights[key] = remaining / otherMetrics.length;
      });
    }
    
    setWeights(newWeights);
  };

  const handleWeightInput = (metric, value) => {
    const numValue = Math.max(0, Math.min(1, parseFloat(value) || 0));
    handleWeightChange(metric, numValue);
  };

  const getScoreColor = (score, type) => {
    if (type === 'composite') {
      if (score >= 70) return 'text-green-600 font-bold';
      if (score >= 50) return 'text-blue-600';
      if (score >= 30) return 'text-orange-600';
      return 'text-red-600';
    }
    return 'text-gray-700';
  };

  const topModels = sortedData.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Multi-Criteria Model Evaluation Framework</h1>
        <p className="text-gray-600 mb-6">
          Combine Privacy, Efficiency, Openness, and QSAR scores with customizable weights to find the optimal model for your needs.
        </p>

        {/* Weight Controls */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 p-4 bg-blue-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Weight: {(weights.privacy * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={weights.privacy}
              onChange={(e) => handleWeightChange('privacy', e.target.value)}
              className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer mb-2"
            />
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={weights.privacy.toFixed(2)}
              onChange={(e) => handleWeightInput('privacy', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
            <p className="text-xs text-gray-500 mt-1">Data protection & security</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Efficiency Weight: {(weights.efficiency * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={weights.efficiency}
              onChange={(e) => handleWeightChange('efficiency', e.target.value)}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer mb-2"
            />
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={weights.efficiency.toFixed(2)}
              onChange={(e) => handleWeightInput('efficiency', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
            <p className="text-xs text-gray-500 mt-1">Performance per resource</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Openness Weight: {(weights.openness * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={weights.openness}
              onChange={(e) => handleWeightChange('openness', e.target.value)}
              className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer mb-2"
            />
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={weights.openness.toFixed(2)}
              onChange={(e) => handleWeightInput('openness', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
            <p className="text-xs text-gray-500 mt-1">Transparency & accessibility</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QSAR Weight: {(weights.qsar * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={weights.qsar}
              onChange={(e) => handleWeightChange('qsar', e.target.value)}
              className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer mb-2"
            />
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={weights.qsar.toFixed(2)}
              onChange={(e) => handleWeightInput('qsar', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
            />
            <p className="text-xs text-gray-500 mt-1">Quality & accuracy metrics</p>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">View Mode:</label>
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="table">Table</option>
              <option value="chart">Bar Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="radar">Radar Chart (Top 5)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="composite">Composite Score</option>
              <option value="privacy">Privacy</option>
              <option value="efficiency">Efficiency</option>
              <option value="openness">Openness</option>
              <option value="qsar">QSAR</option>
            </select>
          </div>

          {viewMode === 'scatter' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">X-Axis:</label>
                <select 
                  value={scatterX} 
                  onChange={(e) => setScatterX(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="privacy">Privacy</option>
                  <option value="efficiency">Efficiency</option>
                  <option value="openness">Openness</option>
                  <option value="qsar">QSAR</option>
                  <option value="compositeScore">Composite Score</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Y-Axis:</label>
                <select 
                  value={scatterY} 
                  onChange={(e) => setScatterY(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="privacy">Privacy</option>
                  <option value="efficiency">Efficiency</option>
                  <option value="openness">Openness</option>
                  <option value="qsar">QSAR</option>
                  <option value="compositeScore">Composite Score</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results Display */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Model</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Composite Score</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Privacy</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Efficiency</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Openness</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">QSAR</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((model, index) => (
                  <tr key={model.name} className={index < 5 ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index < 3 ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-600'}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{model.name}</td>
                    <td className={`px-4 py-3 text-sm text-right ${getScoreColor(model.compositeScore, 'composite')}`}>
                      {model.compositeScore.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">{model.privacy.toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">{model.efficiency.toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">{model.openness.toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">{model.qsar.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'chart' && (
          <div style={{ width: '100%', height: '600px' }}>
            <ResponsiveContainer>
              <BarChart data={sortedData.slice(0, 10)} margin={{ top: 20, right: 30, left: 40, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="shortName" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={11}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value.toFixed(1), name]}
                  labelFormatter={(label) => sortedData.find(d => d.shortName === label)?.name || label}
                />
                <Legend />
                <Bar dataKey="compositeScore" fill="#3B82F6" name="Composite Score" />
                <Bar dataKey="privacy" fill="#10B981" name="Privacy" />
                <Bar dataKey="efficiency" fill="#F59E0B" name="Efficiency" />
                <Bar dataKey="openness" fill="#8B5CF6" name="Openness" />
                <Bar dataKey="qsar" fill="#EF4444" name="QSAR" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {viewMode === 'scatter' && (
          <div style={{ width: '100%', height: '500px' }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis 
                  type="number" 
                  dataKey={scatterX} 
                  name={scatterX.charAt(0).toUpperCase() + scatterX.slice(1)}
                  domain={[0, 100]}
                />
                <YAxis 
                  type="number" 
                  dataKey={scatterY} 
                  name={scatterY.charAt(0).toUpperCase() + scatterY.slice(1)}
                  domain={[0, 100]}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => [value.toFixed(1), name]}
                  labelFormatter={() => ''}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-300 rounded shadow">
                          <p className="font-medium">{data.name}</p>
                          <p>Composite: {data.compositeScore.toFixed(1)}</p>
                          <p>Privacy: {data.privacy.toFixed(1)}</p>
                          <p>Efficiency: {data.efficiency.toFixed(1)}</p>
                          <p>Openness: {data.openness.toFixed(1)}</p>
                          <p>QSAR: {data.qsar.toFixed(1)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  name="Models" 
                  data={sortedData} 
                  fill="#3B82F6"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {viewMode === 'radar' && (
          <div style={{ width: '100%', height: '600px' }}>
            <ResponsiveContainer>
              <RadarChart data={[
                { metric: 'Privacy', ...topModels.reduce((acc, model, i) => ({ ...acc, [model.shortName]: model.privacy }), {}) },
                { metric: 'Efficiency', ...topModels.reduce((acc, model, i) => ({ ...acc, [model.shortName]: model.efficiency }), {}) },
                { metric: 'Openness', ...topModels.reduce((acc, model, i) => ({ ...acc, [model.shortName]: model.openness }), {}) },
                { metric: 'QSAR', ...topModels.reduce((acc, model, i) => ({ ...acc, [model.shortName]: model.qsar }), {}) }
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis domain={[0, 100]} />
                {topModels.map((model, index) => (
                  <Radar
                    key={model.name}
                    name={model.shortName}
                    dataKey={model.shortName}
                    stroke={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'][index]}
                    fill={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'][index]}
                    fillOpacity={0.1}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Key Insights */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Insights</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Top Performer:</h4>
              <p className="text-gray-600">
                <strong>{sortedData[0].name}</strong> leads with a composite score of {sortedData[0].compositeScore.toFixed(1)}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Weight Distribution:</h4>
              <p className="text-gray-600">
                Privacy: {(weights.privacy * 100).toFixed(0)}%, 
                Efficiency: {(weights.efficiency * 100).toFixed(0)}%, 
                Openness: {(weights.openness * 100).toFixed(0)}%, 
                QSAR: {(weights.qsar * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Best Balanced:</h4>
              <p className="text-gray-600">
                {sortedData.filter(m => m.privacy > 50 && m.efficiency > 50 && m.openness > 50 && m.qsar > 50).length} models score above 50 in all categories
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelEvaluationFramework;