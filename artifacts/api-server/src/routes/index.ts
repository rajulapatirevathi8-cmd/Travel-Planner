import { Router, type IRouter } from "express";
import healthRouter from "./health";
import flightsRouter from "./flights";
import busesRouter from "./buses";
import hotelsRouter from "./hotels";
import packagesRouter from "./packages";
import bookingsRouter from "./bookings";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(flightsRouter);
router.use(busesRouter);
router.use(hotelsRouter);
router.use(packagesRouter);
router.use(bookingsRouter);
router.use("/api/payments", paymentsRouter);

export default router;
