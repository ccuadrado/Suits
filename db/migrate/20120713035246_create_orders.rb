class CreateOrders < ActiveRecord::Migration
  def change
    create_table :orders do |t|
      t.string :first_name
      t.string :last_name
      t.string :address
      t.string :address_line_two
      t.string :city
      t.string :state
      t.string :zip
      t.integer :height
      t.integer :weight
      t.integer :chest
      t.integer :arms
      t.integer :bust
      t.integer :waist
      t.integer :hips
      t.integer :inseam
      t.integer :outseam
      t.integer :arm_circumference
      t.integer :leg_circumference

      t.timestamps
    end
  end
end
