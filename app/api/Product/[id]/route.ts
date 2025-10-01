import { NextRequest, NextResponse } from 'next/server';

// Import the products array from the parent route
// Note: In a real application, you'd use a database
// For this demo, we'll duplicate the array reference
let products: Array<{
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}> = [];

// This is a workaround for the demo - in a real app you'd use a database
// We'll access the products from the global scope or use a shared module
declare global {
  var globalProducts: Array<{
    id: number;
    name: string;
    description: string;
    price: number;
    image?: string;
    createdAt: string;
    updatedAt: string;
  }> | undefined;
}

// Initialize global products if not exists
if (!global.globalProducts) {
  global.globalProducts = [
    {
      id: 1,
      name: 'Classic Cotton T-Shirt',
      description: 'A comfortable, breathable cotton t-shirt perfect for everyday wear.',
      price: 29.99,
      image: 'https://via.placeholder.com/300x300?text=T-Shirt',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Denim Jeans',
      description: 'Premium quality denim jeans with a modern fit.',
      price: 79.99,
      image: 'https://via.placeholder.com/300x300?text=Jeans',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
}

products = global.globalProducts;

// PUT /api/Product/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, image } = body;

    // Validation
    if (!name || !description || !price) {
      return NextResponse.json(
        { error: 'Name, description, and price are required' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be 100 characters or less' },
        { status: 400 }
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Find and update the product
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const updatedProduct = {
      ...products[productIndex],
      name,
      description,
      price,
      image: image || undefined,
      updatedAt: new Date().toISOString(),
    };

    products[productIndex] = updatedProduct;
    global.globalProducts = products;

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/Product/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Find the product
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Remove the product
    const deletedProduct = products.splice(productIndex, 1)[0];
    global.globalProducts = products;

    return NextResponse.json(
      { message: 'Product deleted successfully', product: deletedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}