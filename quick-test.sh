#!/bin/bash

# Quick curl commands for testing specific endpoints

# Initialize database
echo "Initializing database..."
curl -X POST http://localhost:3000/api/init

# Admin login
echo -e "\n\nTesting admin login..."
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@angotour.com","password":"admin123"}' | jq

# Create new admin
echo -e "\n\nCreating new admin..."
curl -X POST http://localhost:3000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newadmin@angotour.com",
    "password":"AdminPass123",
    "name":"New Administrator"
  }' | jq

# Get registration data (plans + payment methods)
echo -e "\n\nFetching registration data (for partner registration form)..."
curl http://localhost:3000/api/auth/registration-data | jq

# Register partner
echo -e "\n\nRegistering new partner..."
curl -X POST http://localhost:3000/api/auth/partner/register \
  -H "Content-Type: application/json" \
  -d '{
    "type":"Hotel",
    "companyName":"Hotel Paradise Resort",
    "nif":"1234567890",
    "phone":"+244923456789",
    "email":"contact@hotelparadise.com",
    "loginEmail":"admin@hotelparadise.com",
    "password":"HotelPassword123",
    "province":"Luanda",
    "city":"Luanda",
    "bairro":"Maianga",
    "rua":"Avenida da Revolução"
  }' | jq

# Get all partners
echo -e "\n\nFetching all partners..."
curl http://localhost:3000/api/partners | jq

# Get all plans
echo -e "\n\nFetching all plans..."
curl http://localhost:3000/api/plans | jq

# Get all payment methods
echo -e "\n\nFetching all payment methods..."
curl http://localhost:3000/api/payment-methods | jq

# Get activity logs
echo -e "\n\nFetching activity logs..."
curl http://localhost:3000/api/logs | jq '.[] | {timestamp, action, details}'
