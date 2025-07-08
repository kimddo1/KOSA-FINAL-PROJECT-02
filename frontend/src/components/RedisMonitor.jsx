import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RedisMonitor = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [backupList, setBackupList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const API_BASE = 'http://localhost:8001';

  // 자동 새로고침
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchHealthStatus();
        fetchSessionStats();
        fetchSchedulerStatus();
      }, 30000); // 30초마다 새로고침

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchHealthStatus();
    fetchSessionStats();
    fetchSchedulerStatus();
    fetchBackupList();
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/monitor/health`);
      setHealthStatus(response.data);
    } catch (err) {
      setError('Health status fetch failed');
    }
  };

  const fetchSessionStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/monitor/sessions`);
      setSessionStats(response.data);
    } catch (err) {
      setError('Session stats fetch failed');
    }
  };

  const fetchSchedulerStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/monitor/scheduler/status`);
      setSchedulerStatus(response.data);
    } catch (err) {
      setError('Scheduler status fetch failed');
    }
  };

  const fetchBackupList = async () => {
    try {
      const response = await axios.get(`${API_BASE}/monitor/backups`);
      setBackupList(response.data);
    } catch (err) {
      setError('Backup list fetch failed');
    }
  };

  const handleAction = async (action, data = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      switch (action) {
        case 'cleanup':
          response = await axios.post(`${API_BASE}/monitor/cleanup`);
          break;
        case 'backup':
          response = await axios.post(`${API_BASE}/monitor/backup`, data);
          break;
        case 'start_scheduler':
          response = await axios.post(`${API_BASE}/monitor/scheduler/start`);
          break;
        case 'stop_scheduler':
          response = await axios.post(`${API_BASE}/monitor/scheduler/stop`);
          break;
        case 'enable_auto_cleanup':
          response = await axios.post(`${API_BASE}/monitor/auto-cleanup/enable`);
          break;
        case 'disable_auto_cleanup':
          response = await axios.post(`${API_BASE}/monitor/auto-cleanup/disable`);
          break;
        default:
          throw new Error('Unknown action');
      }
      
      // 성공 시 데이터 새로고침
      fetchHealthStatus();
      fetchSessionStats();
      fetchSchedulerStatus();
      if (action === 'backup') {
        fetchBackupList();
      }
      
      alert(`Action ${action} completed successfully`);
    } catch (err) {
      setError(`Action ${action} failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-100';
      case 'warning': return 'bg-yellow-100';
      case 'critical': return 'bg-red-100';
      case 'unhealthy': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-800">Error: {error}</div>
        <button 
          onClick={() => setError(null)}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Redis Monitor</h1>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto Refresh
            </label>
            <button
              onClick={() => {
                fetchHealthStatus();
                fetchSessionStats();
                fetchSchedulerStatus();
                fetchBackupList();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Health Status */}
        {healthStatus && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Health Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg border ${getStatusBgColor(healthStatus.status)}`}>
                <div className="text-sm text-gray-600">Status</div>
                <div className={`text-lg font-semibold ${getStatusColor(healthStatus.status)}`}>
                  {healthStatus.status?.toUpperCase()}
                </div>
              </div>
              
              {healthStatus.memory && (
                <>
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="text-sm text-gray-600">Memory Usage</div>
                    <div className="text-lg font-semibold">
                      {healthStatus.memory.used_mb}MB / {healthStatus.memory.max_mb}MB
                    </div>
                    <div className="text-sm text-gray-500">
                      {healthStatus.memory.usage_percent}%
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="text-sm text-gray-600">Total Keys</div>
                    <div className="text-lg font-semibold">{healthStatus.keys?.total || 0}</div>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="text-sm text-gray-600">Active Sessions</div>
                    <div className="text-lg font-semibold">{healthStatus.keys?.sessions || 0}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Session Statistics */}
        {sessionStats && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Session Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm text-gray-600">Total Sessions</div>
                <div className="text-2xl font-bold">{sessionStats.total_sessions}</div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm text-gray-600">Total Messages</div>
                <div className="text-2xl font-bold">{sessionStats.total_messages}</div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm text-gray-600">Avg Messages/Session</div>
                <div className="text-2xl font-bold">{sessionStats.avg_messages_per_session}</div>
              </div>
            </div>
          </div>
        )}

        {/* Scheduler Status */}
        {schedulerStatus && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Scheduler Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg border ${schedulerStatus.running ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="text-sm text-gray-600">Running</div>
                <div className={`text-lg font-semibold ${schedulerStatus.running ? 'text-green-600' : 'text-red-600'}`}>
                  {schedulerStatus.running ? 'YES' : 'NO'}
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border ${schedulerStatus.monitoring_enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                <div className="text-sm text-gray-600">Monitoring</div>
                <div className={`text-lg font-semibold ${schedulerStatus.monitoring_enabled ? 'text-green-600' : 'text-gray-600'}`}>
                  {schedulerStatus.monitoring_enabled ? 'ENABLED' : 'DISABLED'}
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border ${schedulerStatus.auto_cleanup_enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                <div className="text-sm text-gray-600">Auto Cleanup</div>
                <div className={`text-lg font-semibold ${schedulerStatus.auto_cleanup_enabled ? 'text-green-600' : 'text-gray-600'}`}>
                  {schedulerStatus.auto_cleanup_enabled ? 'ENABLED' : 'DISABLED'}
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-sm text-gray-600">Active Tasks</div>
                <div className="text-lg font-semibold">{schedulerStatus.active_tasks}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button
              onClick={() => handleAction('cleanup')}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Cleanup
            </button>
            
            <button
              onClick={() => handleAction('backup')}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Backup
            </button>
            
            <button
              onClick={() => handleAction(schedulerStatus?.running ? 'stop_scheduler' : 'start_scheduler')}
              disabled={loading}
              className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
                schedulerStatus?.running 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {schedulerStatus?.running ? 'Stop Scheduler' : 'Start Scheduler'}
            </button>
            
            <button
              onClick={() => handleAction(schedulerStatus?.auto_cleanup_enabled ? 'disable_auto_cleanup' : 'enable_auto_cleanup')}
              disabled={loading}
              className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
                schedulerStatus?.auto_cleanup_enabled 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {schedulerStatus?.auto_cleanup_enabled ? 'Disable Auto Cleanup' : 'Enable Auto Cleanup'}
            </button>
          </div>
        </div>

        {/* Backup List */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Backup Files</h2>
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modified
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backupList.map((backup, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {backup.filename}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.size_mb} MB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(backup.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(backup.modified_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {backupList.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No backup files found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedisMonitor; 