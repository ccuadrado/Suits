class Order < ActiveRecord::Base
  attr_accessible :address, :address_line_two, :arm_circumference, :arms, :bust, :chest, :city, :first_name, :height, :hips, :inseam, :last_name, :leg_circumference, :outseam, :state, :waist, :weight, :zip
end
