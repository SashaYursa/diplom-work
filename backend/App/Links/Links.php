<?php

declare(strict_types=1);

namespace App\Links;

use App\Database\DB;

class Links
{
    private $db;
    private $tableName = 'links';

    public function __construct()
    {
        $this->db = new DB();
    }

    public function getLinks()
    {
        return $this->db->getAll($this->tableName);
    }

    public function updateLinks($name, $link)
    {
        return $this->db->updateLink($name, $link);
    }
}