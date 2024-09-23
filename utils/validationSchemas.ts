import { z } from 'zod';

// Define a regex for IP address validation
const ipRegex = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;

// Zod schema for validating IP addresses
export const ipSchema = z.string().regex(ipRegex, {
  message: "Invalid IP address format",
});

export const portSchema = z.number()
    .min(1, { message: 'Port number be at least 1' })
    .max(65535, { message:  'Port number must be at most 65535' });
