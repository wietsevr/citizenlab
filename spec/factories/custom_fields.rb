FactoryBot.define do
  factory :custom_field do
    resource_type "User"
    sequence(:key) { |n| "field_#{n}" }
    title_multiloc {{
      "en" => "Did you attend"
    }}
    description_multiloc {{
      "en" => "Which councils are you attending in our city?"  
    }}
    required false
    input_type "text"

    factory :custom_field_select do
      title_multiloc {{
        "en" => "Member of councils?"
      }}
      description_multiloc {{
        "en" => "Which councils are you attending in our city?"  
      }}
      required false
      input_type "select"
      enabled true
    end


  end
end
