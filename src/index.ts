import http from 'http';
import express, { Request, Response } from 'express';
import subscriptionRouter from './routes/subscription';
import { errorHandler, requestLogger } from './middleware';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(express.json());
app.use(requestLogger);

// Home route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to home route of node server!!' });
});

//Error handler
app.use(errorHandler);

// Routes
app.use('/api/subscriptions', subscriptionRouter);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
