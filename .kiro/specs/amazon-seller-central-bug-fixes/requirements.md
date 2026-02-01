# Requirements Document

## Introduction

This specification addresses five critical issues in the Amazon Seller Central clone system that are preventing proper functionality across the multi-service architecture. The system consists of a frontend application (port 3000), backend API (port 3001), and backend admin interface (port 3002) that must work together seamlessly for data management and user experience.

## Glossary

- **Frontend**: React application on port 3000 serving end users
- **Backend_API**: Node.js Express server on port 3001 providing REST endpoints
- **Backend_Admin**: React admin interface on port 3002 for configuration management
- **Account_Health_System**: Component managing seller account status and metrics
- **VOC_System**: Voice of Customer product data management system
- **Sales_Snapshot_System**: Business reports sales calculation and display system
- **Authentication_System**: Multi-step login flow with password and OTP verification
- **Chart_System**: Business reports visualization component with dual-axis charts
- **Data_Sync**: Real-time synchronization between admin config and frontend display
- **Image_Upload**: File upload functionality for product images in VOC system

## Requirements

### Requirement 1: Account Health Data Synchronization

**User Story:** As a system administrator, I want Account Health configuration changes to immediately sync to the frontend, so that users see updated account status without delays.

#### Acceptance Criteria

1. WHEN an administrator updates Account Health data in Backend_Admin, THE Backend_API SHALL persist the changes to storage immediately
2. WHEN Account Health data is updated, THE Frontend SHALL reflect the changes without requiring a page refresh
3. WHEN the Frontend requests Account Health data, THE Backend_API SHALL return the most current data from storage
4. WHEN Backend_Admin saves Account Health configuration, THE system SHALL validate data integrity before persistence
5. IF Account Health data sync fails, THEN THE system SHALL log the error and notify the administrator

### Requirement 2: VOC Image Upload Functionality

**User Story:** As a system administrator, I want to upload product images in VOC management, so that the frontend can display complete product information with visuals.

#### Acceptance Criteria

1. WHEN an administrator uploads an image in VOC product management, THE Backend_Admin SHALL send the file to Backend_API for storage
2. WHEN Backend_API receives an image upload, THE system SHALL validate file type and size constraints
3. WHEN an image is successfully uploaded, THE Backend_API SHALL store the file and return a URL reference
4. WHEN VOC product data is saved with images, THE system SHALL associate image URLs with product records
5. WHEN the Frontend displays VOC products, THE system SHALL render images using the stored URL references
6. IF image upload fails, THEN THE system SHALL display an error message and maintain existing data

### Requirement 3: Sales Snapshot Calculation Consistency

**User Story:** As a business analyst, I want Sales Snapshot values to be calculated from Sales Data Config, so that reports show accurate and consistent financial metrics.

#### Acceptance Criteria

1. WHEN Sales Data Config is updated in Backend_Admin, THE system SHALL recalculate all dependent Sales Snapshot values
2. WHEN calculating Sales Snapshot totals, THE system SHALL aggregate values from all Sales Data Config entries
3. WHEN distributing snapshot values, THE system SHALL randomly distribute amounts across sales data entries while maintaining total consistency
4. WHEN Frontend requests Sales Snapshot data, THE Backend_API SHALL return calculated values based on current Sales Data Config
5. WHEN Sales Data Config changes, THE Frontend Sales Snapshot SHALL update automatically without page refresh

### Requirement 4: Authentication Flow Integration

**User Story:** As a user, I want the login process to properly validate my credentials through the backend, so that I can securely access my seller account.

#### Acceptance Criteria

1. WHEN a user enters a username, THE Authentication_System SHALL fetch the associated password and OTP from Backend_API
2. WHEN a user submits a password, THE system SHALL validate it against the fetched password data
3. WHEN password validation succeeds, THE system SHALL retrieve the current OTP for verification
4. WHEN a user enters an OTP, THE system SHALL validate it against the current OTP from Backend_API
5. WHEN authentication succeeds, THE system SHALL establish a session and redirect to the dashboard
6. IF any authentication step fails, THEN THE system SHALL display appropriate error messages and prevent access

### Requirement 5: Business Reports Chart Enhancement

**User Story:** As a business analyst, I want properly scaled charts with correct time ranges, so that I can accurately analyze sales trends over time.

#### Acceptance Criteria

1. WHEN displaying the Compare Sales chart, THE Chart_System SHALL show 13 months from current month +1 to 12 months back
2. WHEN rendering the left Y-axis, THE system SHALL use 2.5k increments (0, 2.5k, 5k, 7.5k, etc.)
3. WHEN rendering the right Y-axis, THE system SHALL use 50k increments (0, 50k, 100k, 150k, etc.)
4. WHEN displaying chart legends, THE system SHALL render "Units ordered" and "Ordered product sales" with proper font sizing
5. WHEN chart data updates, THE system SHALL maintain the specified axis scaling and time range format

### Requirement 6: Real-time Data Synchronization Infrastructure

**User Story:** As a system architect, I want reliable data synchronization between all system components, so that configuration changes are immediately reflected across the application.

#### Acceptance Criteria

1. WHEN any configuration data changes in Backend_Admin, THE system SHALL notify all dependent components
2. WHEN Backend_API data is updated, THE system SHALL invalidate relevant Frontend caches
3. WHEN Frontend components mount, THE system SHALL fetch the most current data from Backend_API
4. WHEN data synchronization fails, THE system SHALL implement retry logic with exponential backoff
5. WHEN multiple users modify data simultaneously, THE system SHALL handle conflicts gracefully

### Requirement 7: File Upload and Storage Management

**User Story:** As a system administrator, I want secure and reliable file upload functionality, so that product images are properly stored and accessible.

#### Acceptance Criteria

1. WHEN processing file uploads, THE Backend_API SHALL validate file types against allowed extensions (jpg, jpeg, png, gif)
2. WHEN storing uploaded files, THE system SHALL generate unique filenames to prevent conflicts
3. WHEN serving uploaded images, THE Backend_API SHALL provide secure URL endpoints
4. WHEN file storage reaches capacity limits, THE system SHALL implement cleanup policies for old files
5. IF file upload fails due to size or type restrictions, THEN THE system SHALL return descriptive error messages

### Requirement 8: Error Handling and Logging

**User Story:** As a system administrator, I want comprehensive error handling and logging, so that I can quickly identify and resolve system issues.

#### Acceptance Criteria

1. WHEN any system error occurs, THE system SHALL log detailed error information with timestamps
2. WHEN API requests fail, THE system SHALL return appropriate HTTP status codes and error messages
3. WHEN Frontend components encounter errors, THE system SHALL display user-friendly error messages
4. WHEN critical errors occur, THE system SHALL implement fallback mechanisms to maintain functionality
5. WHEN errors are logged, THE system SHALL include context information for debugging purposes