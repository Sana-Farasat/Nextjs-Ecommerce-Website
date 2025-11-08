import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion, token } from "../env";
import { v4 as uuidv4 } from 'uuid';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false, // Set to false if statically generating pages, using ISR or tag-based revalidation
  // token: process.env.SANITY_API_TOKEN,
});

// Groq queries
export async function getProducts() {
  return client.fetch(`*[_type == "product"] | order(_createdAt desc) {
    _id, title, slug, image, price, description
  }`);
}

export async function getProduct(slug: string) {
  return client.fetch(
    `*[_type == "product" && slug.current == '${slug}'] {
      _id, title, slug, image, price, description,
    }`,
    { slug } 
  );
}

// export async function createOrder(orderData: any) {
//   return client.create({ _type: "order", ...orderData });
// }

export async function createOrder(orderData: any) {
  const itemsWithKey = orderData.items.map((item: any) => ({
    ...item,
    _key: uuidv4(), // Unique key
  }));

  return client.create({
    _type: "order",
    ...orderData,
    items: itemsWithKey,
  });
}

export async function updateOrderStatus(orderId: string, status: string) {
  return client.patch(orderId).set({ status }).commit();
}

export async function getOrders() {
  return client.fetch(`*[_type == "order"] | order(createdAt desc) {
    _id, id, items, total, status, customerEmail,paymentMethod, createdAt,
    items[] {
      _key,
      quantity,
      "product": product-> { title }
    }
  }`);
}

export async function getOrder(id: string) {
  return client.fetch(
    `*[_type == "order" && _id == $id][0]{
      _id, id, total, customerEmail, paymentMethod,createdAt,
      items[] {
      _key,
      quantity,
      "product": product-> { title }
    }
    }`,
    { id }
  );
}
