import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Wifi, Server, Database } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

const ErrorPage = ({ 
  error, 
  errorInfo, 
  onRetry, 
  onGoHome, 
  onGoBack, 
  title = "Something went wrong",
  showDetails = false 
}) => {
  const getErrorIcon = () => {
    if (error?.message?.includes('Network') || error?.message?.includes('fetch')) {
      return <Wifi className="h-16 w-16 text-red-500" />;
    }
    if (error?.message?.includes('Server') || error?.message?.includes('500')) {
      return <Server className="h-16 w-16 text-orange-500" />;
    }
    if (error?.message?.includes('Database') || error?.message?.includes('connection')) {
      return <Database className="h-16 w-16 text-yellow-500" />;
    }
    return <AlertTriangle className="h-16 w-16 text-red-500" />;
  };

  const getErrorType = () => {
    if (error?.message?.includes('Network') || error?.message?.includes('fetch')) {
      return "Network Connection Error";
    }
    if (error?.message?.includes('Server') || error?.message?.includes('500')) {
      return "Server Error";
    }
    if (error?.message?.includes('Database') || error?.message?.includes('connection')) {
      return "Database Connection Error";
    }
    return "Application Error";
  };

  const getErrorMessage = () => {
    if (error?.message?.includes('Network') || error?.message?.includes('fetch')) {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    }
    if (error?.message?.includes('Server') || error?.message?.includes('500')) {
      return "The server encountered an error while processing your request. Please try again later.";
    }
    if (error?.message?.includes('Database') || error?.message?.includes('connection')) {
      return "Unable to connect to the database. Please try again in a few moments.";
    }
    return error?.message || "An unexpected error occurred. Please try again.";
  };

  const getSuggestions = () => {
    if (error?.message?.includes('Network') || error?.message?.includes('fetch')) {
      return [
        "Check your internet connection",
        "Verify the server is running",
        "Try refreshing the page",
        "Check if there are any firewall restrictions"
      ];
    }
    if (error?.message?.includes('Server') || error?.message?.includes('500')) {
      return [
        "Wait a few minutes and try again",
        "Check if the service is under maintenance",
        "Contact support if the problem persists",
        "Try accessing a different page"
      ];
    }
    return [
      "Refresh the page",
      "Clear your browser cache",
      "Try again in a few moments",
      "Contact support if the problem continues"
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            {getErrorIcon()}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
            {title}
          </CardTitle>
          <p className="text-gray-600 text-lg">
            {getErrorType()}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-center">
              {getErrorMessage()}
            </p>
          </div>

          {/* Suggestions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2 text-center">
              Try these solutions:
            </h4>
            <ul className="text-blue-700 space-y-1 text-sm">
              {getSuggestions().map((suggestion, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button 
                onClick={onRetry} 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            
            {onGoBack && (
              <Button 
                onClick={onGoBack} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            )}
            
            {onGoHome && (
              <Button 
                onClick={onGoHome} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            )}
          </div>

          {/* Error Details (Collapsible) */}
          {showDetails && error && (
            <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                Show Error Details
              </summary>
              <div className="space-y-3 text-sm">
                {error.message && (
                  <div>
                    <strong>Message:</strong>
                    <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                      {error.message}
                    </pre>
                  </div>
                )}
                {error.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto text-xs">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto text-xs">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
