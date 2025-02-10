const Category = require('../models/ProductCategory');
const CustomError = require('../utils/customError');
const logger = require("../utils/logger");
const HierarchyHelper = require("../helpers/hierarchyHelper");

class ProductCategoryService
{

    static async getAllChildrenCategories(parentId)
    {
        try
        {
            return await HierarchyHelper.getAllChildren(parentId, Category.fetchChildren);
        } catch (error)
        {
            logger.error('Error retrieving all children categories:', error);
            throw new CustomError('Failed to retrieve all children categories', 500);
        }
    }

    static async getAllParentCategories(childId)
    {
        try
        {
            return await HierarchyHelper.getAllParents(childId, Category.fetchParent);
        } catch (error)
        {
            logger.error('Error retrieving all parent categories:', error);
            throw new CustomError('Failed to retrieve all parent categories', 500);
        }
    }

    static async getAllCategories(options)
    {
        try
        {
            return await Category.getAll(options);
        } catch (error)
        {
            logger.error('Error retrieving categories:', error);
            throw new CustomError('Failed to retrieve categories', 500);
        }
    }

    static async getParentCategory()
    {
        try
        {
            return await Category.getAllParentCategories();
        } catch (error)
        {
            logger.error('Error retrieving parent categories:', error);
            throw new CustomError('Failed to retrieve parent categories', 500);
        }
    }

    static async index()
    {
        try
        {
            return await Category.getAll();
        } catch (error)
        {
            console.error('Error fetching categories:', error);
            throw new CustomError('Failed to fetch categories', 500);
        }
    }

    static async create(data)
    {
        try
        {
            return await Category.create(data);
        } catch (error)
        {
            console.error('Error creating category:', error);
            throw new CustomError('Failed to create category', 500);
        }
    }

    static async update(id, data)
    {
        try
        {
            const category = await Category.findById(id);
            if (!category)
            {
                throw new CustomError('Category not found', 404);
            }

            return await Category.update(id, data);
        } catch (error)
        {
            console.error('Error updating category:', error);
            if (error instanceof CustomError) throw error;
            throw new CustomError('Failed to update category', 500);
        }
    }

    static async delete(id)
    {
        try
        {
            const category = await Category.findById(id);
            if (!category)
            {
                throw new CustomError('Category not found', 404);
            }

            const isDeleted = await Category.delete(id);
            if (!isDeleted)
            {
                throw new CustomError('Failed to delete category', 500);
            }

            return true;
        } catch (error)
        {
            console.error('Error deleting category:', error);
            if (error instanceof CustomError) throw error;
            throw new CustomError('Failed to delete category', 500);
        }
    }
}

module.exports = ProductCategoryService;
