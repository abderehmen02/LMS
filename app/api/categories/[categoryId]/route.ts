import { db } from "@/lib/db"
import { NextApiRequest } from "next"
import { NextRequest, NextResponse } from "next/server"

export const DELETE = async  (req : Request , { params  }: { params: { categoryId: string }} )=>{
const categoryId = params.categoryId
console.log("deleting a category")
await db.category.delete({
    where : {
        id : categoryId
    }
})
const newCategories = await db.category.findMany()
console.log("new categories" , newCategories)
return NextResponse.json({newCategories})
}