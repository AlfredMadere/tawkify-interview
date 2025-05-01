/* use the CsvTextArea Parser to parse the users csv file and create users in the database 

User the schema defined in prisma/schema.prisma 


*/
'use client';

import { CsvTextareaParser } from '@/components/csv-textarea-parser';
import { seedUsersFromObjects } from './actions';
import { toast } from 'sonner';

export default function SeedUsersPage() {
  // Define column definitions for the CSV parser
  const columns = [
    { key: 'name', label: 'User Name', required: true, fakerMethod: 'person.fullName' },
    { key: 'email', label: 'Email Address', required: true, fakerMethod: 'internet.email' },
    { key: 'bio', label: 'User Bio', required: false, fakerMethod: 'lorem.sentence' },
    { key: 'age', label: 'User Age', required: true, fakerMethod: 'number.int({min: 18, max: 80})' },
    { key: 'gender', label: 'User Gender', required: true, valueOptions: [
      { value: 'Male', description: 'Male' },
      { value: 'Female', description: 'Female' },
      { value: 'Non-binary', description: 'Non-binary' },
    ]},
    { key: 'lat', label: 'Latitude', required: true, fakerMethod: 'location.latitude' },
    { key: 'lng', label: 'Longitude', required: true, fakerMethod: 'location.longitude' },
    { key: 'minAge', label: 'Min Age Preference', required: true, fakerMethod: 'number.int({min: 18, max: 40})' },
    { key: 'maxAge', label: 'Max Age Preference', required: true, fakerMethod: 'number.int({min: 25, max: 80})' },
    { key: 'minWeight', label: 'Min Weight Preference (lbs)', required: true, fakerMethod: 'number.int({min: 5, max: 30})' },
    { key: 'maxWeight', label: 'Max Weight Preference (lbs)', required: true, fakerMethod: 'number.int({min: 20, max: 100})' },
    { key: 'dogName', label: 'Dog Name', required: true, fakerMethod: 'animal.dog' },
    { key: 'dogBreed', label: 'Dog Breed', required: true, fakerMethod: 'animal.dog' },
    { key: 'dogAge', label: 'Dog Age', required: true, fakerMethod: 'number.int({min: 1, max: 15})' },
    { key: 'dogPersonFriendliness', label: 'Person Friendliness (1-10)', required: true, fakerMethod: 'number.int({min: 1, max: 10})' },
    { key: 'dogDogFriendliness', label: 'Dog Friendliness (1-10)', required: true, fakerMethod: 'number.int({min: 1, max: 10})' },
    { key: 'dogWeight', label: 'Dog Weight (lbs)', required: true, fakerMethod: 'number.int({min: 5, max: 100})' },
    { key: 'dogSex', label: 'Dog Sex', required: true, valueOptions: [
      { value: 'Male', description: 'Male' },
      { value: 'Female', description: 'Female' },
    ]},
    { key: 'dogDescription', label: 'Dog Description', required: false, fakerMethod: 'lorem.sentence' },
  ];

  // Handle form submission by processing the parsed CSV data
  const handleSubmit = async (data: Record<string, string>[]) => {
    try {
      if (!data || data.length === 0) {
        toast.error('No data to process');
        return 0;
      }

      toast.info('Processing data...', {
        description: `Processing ${data.length} records`
      });

      // Process each row to ensure proper data types and match UserSeedData interface
      const processedData = data.map((row, index) => {
        // Log each row for debugging
        console.log(`Processing row ${index}:`, row);
        
        const lat = parseFloat(row.lat || '0');
        const lng = parseFloat(row.lng || '0');
        
        const processed = {
          name: row.name?.trim() || '',
          email: row.email?.trim() || '',
          bio: row.bio?.trim() || null,
          age: parseInt(row.age || '0'),
          gender: row.gender?.trim() || '',
          location: { lat, lng }, // Create the location object as required by UserSeedData
          minAge: parseInt(row.minAge || '0'),
          maxAge: parseInt(row.maxAge || '0'),
          minWeight: parseFloat(row.minWeight || '0'),
          maxWeight: parseFloat(row.maxWeight || '0'),
          dogName: row.dogName?.trim() || '',
          dogBreed: row.dogBreed?.trim() || '',
          dogAge: parseInt(row.dogAge || '0'),
          dogPersonFriendliness: parseInt(row.dogPersonFriendliness || '0'),
          dogDogFriendliness: parseInt(row.dogDogFriendliness || '0'),
          dogWeight: parseFloat(row.dogWeight || '0'),
          dogSex: row.dogSex?.trim() || '',
          dogDescription: row.dogDescription?.trim() || null,
        };
        
        // Log processed row for debugging
        console.log(`Processed row ${index}:`, processed);
        
        // Validate the processed data
        if (isNaN(processed.age) || isNaN(processed.location.lat) || isNaN(processed.location.lng) || 
            isNaN(processed.minAge) || isNaN(processed.maxAge) || 
            isNaN(processed.minWeight) || isNaN(processed.maxWeight) || 
            isNaN(processed.dogAge) || isNaN(processed.dogPersonFriendliness) || 
            isNaN(processed.dogDogFriendliness) || isNaN(processed.dogWeight)) {
          console.error(`Row ${index} has invalid numeric values:`, processed);
        }
        
        return processed;
      });
      
      // Filter out rows with invalid data
      const validData = processedData.filter(row => 
        !isNaN(row.age) && !isNaN(row.location.lat) && !isNaN(row.location.lng) && 
        !isNaN(row.minAge) && !isNaN(row.maxAge) && 
        !isNaN(row.minWeight) && !isNaN(row.maxWeight) && 
        !isNaN(row.dogAge) && !isNaN(row.dogPersonFriendliness) && 
        !isNaN(row.dogDogFriendliness) && !isNaN(row.dogWeight) &&
        row.name && row.email // Ensure required fields are present
      );
      
      if (validData.length < processedData.length) {
        toast.warning(`Filtered out ${processedData.length - validData.length} rows with invalid data`);
      }
      
      if (validData.length === 0) {
        toast.error('No valid data to process');
        return 0;
      }
      
      // Call the server action with the valid data objects directly
      const result = await seedUsersFromObjects(validData);
      
      if (!result.success) {
        toast.error('Failed to seed users', {
          description: result.error
        });
        return 0;
      }
      
      toast.success('Users seeded successfully', {
        description: `Created ${result.data.count} users with their dogs`
      });
      
      return result.data.count;
    } catch (error) {
      console.error('Error processing CSV data:', error);
      toast.error('Error processing data', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  };

  return (
    <div className="container py-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Seed Users</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Instructions</h2>
        <p className="mb-2">Paste CSV data to create users and their dogs in the database.</p>
        
        <div className="flex items-center gap-2 mt-4">
          <a 
            href="/sample-users.csv" 
            download
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
          >
            <span>Download Sample CSV</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </a>
        </div>
      </div>
      
      <CsvTextareaParser
        onSubmit={handleSubmit}
        columns={columns}
        title="Upload User Data"
        exampleRowCount={3}
      />
    </div>
  );
}