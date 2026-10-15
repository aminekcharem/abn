import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  value === null || (typeof value === "string" && value.trim() === "")
    ? undefined
    : value;
const optionalText = (max = 191) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());
const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess(
    (value) => {
      const cleaned = emptyToUndefined(value);
      return cleaned === undefined ? undefined : Number(cleaned);
    },
    schema.optional(),
  );
const optionalEnum = <T extends [string, ...string[]]>(values: T) =>
  z.preprocess(emptyToUndefined, z.enum(values).optional());
const optionalDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide.")
  .or(z.literal(""))
  .optional();

export const vehicleSchema = z
  .object({
    title: z.string().trim().min(3, "Le titre est obligatoire."),
    slug: z.string().trim().min(3, "Le slug est obligatoire."),
    brandId: z.string().min(1, "Selectionnez une marque."),
    categoryId: optionalText(),
    model: optionalText(),
    generation: optionalText(),
    trim: optionalText(),
    engineCode: optionalText(),
    motorization: optionalText(),
    price: z.coerce.number().positive("Le prix doit etre superieur a 0."),
    priceCurrency: z.enum(["TND", "EUR"]),
    year: optionalNumber(
      z
        .number()
        .int("L'annee doit etre un nombre entier.")
        .min(1950, "Annee invalide.")
        .max(new Date().getFullYear() + 1, "Annee invalide."),
    ),
    status: z.enum(["BROUILLON", "DISPONIBLE", "VENDU", "RESERVE"]),
    isFeatured: z.coerce.boolean(),
    isNew: z.coerce.boolean(),
    firstRegistrationDate: optionalDate,
    power: optionalNumber(
      z.number().int().positive("La puissance doit etre superieure a 0."),
    ),
    displacement: z.string().trim().max(40).optional(),
    engine: optionalText(),
    fuelType: optionalEnum(["ESSENCE", "DIESEL", "HYBRIDE", "ELECTRIQUE"]),
    transmission: optionalText(),
    gearbox: optionalText(),
    mileage: optionalNumber(z.number().int().min(0, "Kilometrage invalide.")),
    doors: optionalNumber(z.number().int().min(1).max(8)),
    seats: optionalNumber(z.number().int().min(1).max(12)),
    colorName: optionalText(),
    colorHex: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide.")
        .optional(),
    ),
    registration: optionalText(),
    vin: optionalText(40),
    description: z.string().trim().optional(),
    optionIds: z.array(z.string()).default([]),
    existingImages: z.array(z.string()).default([]),
    existingVideos: z.array(z.string()).default([]),
  });

export type VehicleFormInput = z.infer<typeof vehicleSchema>;

export type VehicleActionState = {
  ok: boolean;
  message: string;
  redirectTo?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialVehicleActionState: VehicleActionState = {
  ok: false,
  message: "",
};
