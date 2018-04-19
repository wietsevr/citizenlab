module SmartGroupRules
  class Role
    include ActiveModel::Validations

    PREDICATE_VALUES = %w(is_admin not_is_admin)
    RULE_TYPE = "role"

    attr_accessor :predicate

    validates :predicate, presence: true
    validates :predicate, inclusion: { in: self::PREDICATE_VALUES }

    def self.to_json_schema custom_field, locale

    end

    def self.from_json json
      self.new(json['predicate'])
    end

    def initialize predicate
      self.predicate = predicate
    end

    def filter users_scope
      case predicate
      when 'is_admin'
        users_scope.admin
      when 'not_is_admin'
        users_scope #todo
      else
        raise "Unsupported predicate #{predicate}"
      end
    end

    private

    def needs_value?
      !%w(is_empty not_is_empty).include?(predicate)
    end

  end
end