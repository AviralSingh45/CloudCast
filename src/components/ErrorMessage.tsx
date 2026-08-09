import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Settings } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onShowApiKeyModal?: () => void;
  showApiKeyButton?: boolean;
}

export const ErrorMessage = ({ 
  message, 
  onRetry, 
  onShowApiKeyModal, 
  showApiKeyButton = false 
}: ErrorMessageProps) => {
  const isApiKeyError = message.toLowerCase().includes('api key');

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-6">
      <div className="text-center space-y-4">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        {/* Error Alert */}
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-left">
            {message}
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isApiKeyError && onShowApiKeyModal && (
            <Button 
              onClick={onShowApiKeyModal}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Set API Key
            </Button>
          )}
          
          {showApiKeyButton && onShowApiKeyModal && !isApiKeyError && (
            <Button 
              variant="outline"
              onClick={onShowApiKeyModal}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Update API Key
            </Button>
          )}
          
          {onRetry && (
            <Button 
              variant={isApiKeyError ? "outline" : "default"}
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>

      {/* Helpful Tips */}
      <div className="max-w-md mx-auto text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Having trouble? Here are some things to check:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Make sure your API key is valid and active</li>
          <li>• Check your internet connection</li>
          <li>• Verify the city name spelling</li>
          <li>• Try searching for a different location</li>
        </ul>
      </div>
    </div>
  );
};