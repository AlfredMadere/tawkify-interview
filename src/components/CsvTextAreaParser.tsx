'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface CsvTextAreaParserProps {
  onParse: (csvText: string) => Promise<any>;
  title: string;
  description: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
}

export function CsvTextAreaParser({
  onParse,
  title,
  description,
  placeholder = 'Paste your CSV data here...',
  buttonText = 'Parse and Upload',
  successMessage = 'Data uploaded successfully!',
}: CsvTextAreaParserProps) {
  const [csvText, setCsvText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvText(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvText.trim()) {
      toast.error('Please enter CSV data');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await onParse(csvText);
      
      if (result.success) {
        toast.success(`${successMessage} Created ${result.data.count} records.`);
        setCsvText(''); // Clear the textarea on success
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Error parsing CSV:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            value={csvText}
            onChange={handleTextChange}
            placeholder={placeholder}
            className="min-h-[300px] font-mono text-sm"
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Processing...' : buttonText}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
