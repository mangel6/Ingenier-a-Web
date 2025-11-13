# 📋 Clinical Documents Upload Specification

## Overview
This specification defines the database schema and API endpoint for uploading clinical documents in the medical system. The design follows existing backend patterns established for user registration and login.

## 🗄️ Database Schema

### Table: `clinical_documents`

```sql
CREATE TABLE clinical_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id VARCHAR(36) NOT NULL, -- UUID of the patient
    uploaded_by_user_id VARCHAR(36) NOT NULL, -- UUID of the doctor who uploaded
    kind ENUM('PDF', 'IMAGE', 'DOCUMENT') NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_content_base64 LONGTEXT NOT NULL, -- Base64 encoded file content
    mime_type VARCHAR(100) NOT NULL,
    size_bytes INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key constraints (assuming users table exists)
    INDEX idx_patient_id (patient_id),
    INDEX idx_uploaded_by (uploaded_by_user_id),
    INDEX idx_uploaded_at (uploaded_at),

    -- Add foreign key constraints if needed
    -- FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    -- FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Field Descriptions
- `id`: Auto-incrementing primary key
- `patient_id`: UUID of the patient the document belongs to
- `uploaded_by_user_id`: UUID of the doctor who uploaded the document
- `kind`: Type of document (PDF, IMAGE, DOCUMENT)
- `filename`: Original filename of the uploaded file
- `file_content_base64`: Base64 encoded file content for storage
- `mime_type`: MIME type of the file (e.g., "application/pdf", "image/jpeg")
- `size_bytes`: Size of the file in bytes
- `uploaded_at`: Timestamp when the document was uploaded
- `created_at`: Record creation timestamp
- `updated_at`: Record update timestamp

## 🔗 API Endpoint

### POST `/api/v1/clinical-documents`

Uploads a clinical document with associated metadata.

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token> (optional, if using JWT authentication)
```

#### Request Body
```json
{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "uploadedByUserId": "550e8400-e29b-41d4-a716-446655440001",
  "kind": "PDF",
  "filename": "historia_clinica_juan_perez.pdf",
  "fileContentBase64": "JVBERi0xLjQKJeLjz9MK...",
  "mimeType": "application/pdf",
  "sizeBytes": 245760
}
```

#### Request Field Validation
- `patientId`: Required, must be a valid UUID
- `uploadedByUserId`: Required, must be a valid UUID
- `kind`: Required, must be one of: "PDF", "IMAGE", "DOCUMENT"
- `filename`: Required, max 255 characters
- `fileContentBase64`: Required, valid base64 string
- `mimeType`: Required, valid MIME type string
- `sizeBytes`: Required, positive integer

#### Response - Success (201 Created)
```json
{
  "success": true,
  "message": "Documento clínico subido exitosamente",
  "document": {
    "id": 1,
    "patientId": "550e8400-e29b-41d4-a716-446655440000",
    "uploadedByUserId": "550e8400-e29b-41d4-a716-446655440001",
    "kind": "PDF",
    "filename": "historia_clinica_juan_perez.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 245760,
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Response - Validation Error (400 Bad Request)
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": [
    {
      "field": "patientId",
      "message": "El ID del paciente debe ser un UUID válido"
    },
    {
      "field": "kind",
      "message": "Tipo de documento inválido. Debe ser PDF, IMAGE o DOCUMENT"
    }
  ]
}
```

#### Response - Unauthorized (401 Unauthorized)
```json
{
  "success": false,
  "message": "No autorizado. Token de autenticación requerido"
}
```

#### Response - Forbidden (403 Forbidden)
```json
{
  "success": false,
  "message": "Acceso denegado. Solo doctores pueden subir documentos clínicos"
}
```

#### Response - Internal Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

## 🔒 Security Considerations

### Authentication
- Require valid JWT token in Authorization header
- Validate that the authenticated user is a doctor (`tipoUsuario: "doctor"`)
- Ensure `uploadedByUserId` matches the authenticated user's ID

### File Upload Security
- Validate file size (max 10MB recommended)
- Validate MIME types against allowed types
- Scan for malware (recommended)
- Store files securely with proper access controls

### Data Validation
- Validate all required fields are present
- Validate UUID formats for patient and doctor IDs
- Validate base64 encoding
- Sanitize filename to prevent path traversal attacks

## 📝 Implementation Notes

### Node.js/Express Example
```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken'); // If using JWT

const app = express();
app.use(express.json({ limit: '10mb' })); // Increase limit for file uploads

// Middleware to verify JWT and doctor role
const authenticateDoctor = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado. Token requerido'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tipoUsuario !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo doctores pueden subir documentos'
      });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

app.post('/api/v1/clinical-documents', authenticateDoctor, async (req, res) => {
  try {
    const {
      patientId,
      uploadedByUserId,
      kind,
      filename,
      fileContentBase64,
      mimeType,
      sizeBytes
    } = req.body;

    // Validation logic here...

    // Insert into database
    const [result] = await db.execute(
      `INSERT INTO clinical_documents
       (patient_id, uploaded_by_user_id, kind, filename, file_content_base64, mime_type, size_bytes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patientId, uploadedByUserId, kind, filename, fileContentBase64, mimeType, sizeBytes]
    );

    res.status(201).json({
      success: true,
      message: 'Documento clínico subido exitosamente',
      document: {
        id: result.insertId,
        patientId,
        uploadedByUserId,
        kind,
        filename,
        mimeType,
        sizeBytes,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error uploading clinical document:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});
```

### Frontend Integration
The frontend already has the upload functionality implemented in `app/dashboard/doctor/upload/page.tsx` and backend integration in `js/backend-integration.js`. The endpoint URL in the integration code should be updated to `/api/v1/clinical-documents` to match this specification.

### Future Enhancements
- File storage on cloud services (AWS S3, Google Cloud Storage)
- Document versioning
- Document search and filtering
- Document access logs
- Document expiration and cleanup policies

## 🧪 Testing

### Sample Test Cases
1. Valid PDF upload with all required fields
2. Invalid patient ID (non-UUID)
3. Missing required fields
4. File too large
5. Invalid MIME type
6. Unauthorized access (non-doctor user)
7. Invalid JWT token

### Postman Collection
```json
{
  "info": {
    "name": "Clinical Documents API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Upload Clinical Document",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer YOUR_JWT_TOKEN"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"patientId\":\"550e8400-e29b-41d4-a716-446655440000\",\"uploadedByUserId\":\"550e8400-e29b-41d4-a716-446655440001\",\"kind\":\"PDF\",\"filename\":\"test.pdf\",\"fileContentBase64\":\"JVBERi0xLjQKJeLjz9MK\",\"mimeType\":\"application/pdf\",\"sizeBytes\":1024}"
        },
        "url": {
          "raw": "{{base_url}}/api/v1/clinical-documents",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "clinical-documents"]
        }
      }
    }
  ]
}