import { NextRequest, NextResponse } from 'next/server';

// Global type declaration for shared products array
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
  var nextProductId: number | undefined;
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

if (!global.nextProductId) {
  global.nextProductId = 3;
}

const products = global.globalProducts;
let nextId = global.nextProductId;

// GET /api/Product - Fetch all products
export async function GET() {
  try {
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/Product - Create a new product
export async function POST(request: NextRequest) {
  try {
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

    // Create new product
    const newProduct = {
      id: nextId++,
      name,
      description,
      price,
      image: image || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.push(newProduct);
    global.nextProductId = nextId;

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}