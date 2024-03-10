import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@supabase/supabase-js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SECRET!
);

export default async function Home() {
  const { data: donations, error } = await supabase.from("donations").select("*")

  if (error) {
    console.error(error);
    return;
  }

  async function donate(formData: FormData) {
    'use server';

    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: "donacion",
            title: formData.get("message") as string,
            quantity: 1,
            unit_price: Number(formData.get("amount")),
          },
        ],
      },
    });

    redirect(preference.sandbox_init_point!);
  }
  return (
    <section className="grid gap-12">
      <h1 className="text-3xl font-extrabold italic text-center my-10">
        Mercado Pago
      </h1>
      <form
        action={donate}
        className="m-auto grid gap-8 border p-4 max-w-96 rounded-xl shadow-lg  border-sky-300"
      >
        <Label className="grid gap-2">
          <span>valor</span>
          <Input type="number" name="amount" />
        </Label>
        <Label className="grid gap-2">
          <span>Tu mensaje en la donacion</span>
          <Textarea name="message" />
        </Label>
        <Button className="bg-blue-500" type="submit">
          Enviar por Mercado Pago
        </Button>
      </form>

      <Table>

        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">CANTIDAD</TableHead>
            <TableHead className="font-bold">Mensaje</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {donations.map((donation) => {
            
            return ( 
             <TableRow key={donation.id}>
                 <TableCell className="font-bold">
                   {donation.amount.toLocaleString("es-AR", {style: "currency", currency: "ARS"})}
                 </TableCell>
               <TableCell className="text-right">{donation.message}</TableCell>
             </TableRow>
            );  
        })}
        </TableBody>

      </Table>
    </section>
  );
}
