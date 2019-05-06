module SmartGroupRules
  class ParticipatedInIdeaStatus
    include ActiveModel::Validations

    PREDICATE_VALUES = %w(is not_is)
    VALUELESS_PREDICATES = []
    RULE_TYPE = 'participated_in_idea_status'

    attr_accessor :predicate, :value

    validates :predicate, presence: true
    validates :predicate, inclusion: { in: PREDICATE_VALUES }
    validates :value, presence: true, inclusion: { in: -> (record) { IdeaStatus.pluck(:id) } }

    def self.to_json_schema
      [   
        {
          "type": "object",
          "required" => ["ruleType", "predicate", "value"],
          "additionalProperties" => false,
          "properties" => {
            "ruleType" => {
              "type" => "string",
              "enum" => [RULE_TYPE],
            },
            "predicate" => {
              "type": "string",
              "enum": PREDICATE_VALUES - VALUELESS_PREDICATES,
            },
            "value" => {
              "description" => "The id of an idea status",
              "type" => "string"
            }
          },
        },
      ]
    end

    def self.from_json json
      self.new(json['predicate'], json['value'])
    end

    def initialize predicate, value
      self.predicate = predicate
      self.value = value
    end

    def filter users_scope
      participants_service = ParticipantsService.new
      participants = participants_service.idea_statuses_participants([IdeaStatus.find(value)])

      case predicate
      when 'is'
        users_scope.where(id: participants)
      when 'not_is'
        users_scope.where.not(id: participants)
      else
        raise "Unsupported predicate #{predicate}"
      end
    end

  end
end