<?php

declare(strict_types=1);

namespace App\Categories;

use App\Database\DB;

class Categories
{
    private $db;
    private $tableName = 'articles_category';

    public function __construct()
    {
        $this->db = new DB();
    }

    public function getAllCategoriesWithPostsCount()
    {
        $categories = $this->db->getAll($this->tableName);
        foreach ($categories as $key => $category) {
            $categories[$key]['posts'] = $this->db->getCountElementsWithParam(
                'articles',
                'id',
                'category_id',
                $category['id']
            )[0];
        }
        return $categories;
    }

    public function getAllCategories()
    {
        return $this->db->getAll($this->tableName);
    }

    public function addCategory($name)
    {
        $name = htmlspecialchars($name);
        return $this->db->insertCategory($name);
    }

    public function checkCategory($id)
    {
        $res = $this->db->getFromTable($this->tableName, 'id', $id);
        if (isset($res['error'])) {
            return false;
        }
        return true;
    }

    public function removeCategory($id)
    {
        $this->db->deleteFromTable($this->tableName, 'id', $id);
        return true;
    }

    public function updateCategory($id, $val)
    {
        return $this->db->updateItemInTable($this->tableName, 'name', $val, $id);
    }

}